// SAP Document Information Extraction (DIE) client.
// Falls back to mock extraction when DIE_* env vars aren't set, so the
// upload → decide → escalate chain works end-to-end before DIE is provisioned.

const axios = require('axios');

let cachedToken = null;
let tokenExpiry = 0;

function isConfigured() {
  return !!(
    process.env.DIE_UAA_URL &&
    process.env.DIE_CLIENT_ID &&
    process.env.DIE_CLIENT_SECRET &&
    process.env.DIE_SERVICE_URL
  );
}

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const resp = await axios.post(`${process.env.DIE_UAA_URL}/oauth/token`, null, {
    params: { grant_type: 'client_credentials' },
    auth: {
      username: process.env.DIE_CLIENT_ID,
      password: process.env.DIE_CLIENT_SECRET
    }
  });

  cachedToken = resp.data.access_token;
  tokenExpiry = Date.now() + (resp.data.expires_in - 60) * 1000;
  return cachedToken;
}

// Verified against a real SAP_invoice_schema response on 2026-10-27.
async function extractFromBuffer(buffer, fileName, mimeType) {
  const token = await getToken();
  const FormData = require('form-data');

  const form = new FormData();
  form.append('options', JSON.stringify({ schemaName: 'SAP_invoice_schema', clientId: 'default' }));
  form.append('fileType', 'document');
  form.append('file', buffer, { filename: fileName, contentType: mimeType });

  const submit = await axios.post(`${process.env.DIE_SERVICE_URL}/document-information-extraction/v1/document/jobs`, form, {
    headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
  });
  const jobId = submit.data.id;

  for (let i = 0; i < 20; i++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const status = await axios.get(`${process.env.DIE_SERVICE_URL}/document-information-extraction/v1/document/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (status.data.status === 'DONE') {
      return mapInvoiceExtractionToClaimFields(status.data.extraction);
    }
    if (status.data.status === 'FAILED') {
      throw new Error(`DIE extraction failed: ${JSON.stringify(status.data)}`);
    }
  }

  throw new Error('DIE extraction timed out');
}

// SAP_invoice_schema's real field names, translated to the same canonical
// claim-field vocabulary the mock extraction already uses.
const HEADER_FIELD_MAP = {
  grossAmount: 'claimAmount',
  currencyCode: 'currency',
  receiverContact: 'customerName'
};

function mapInvoiceExtractionToClaimFields(extraction) {
  const fields = [];

  for (const f of extraction.headerFields || []) {
    const mappedName = HEADER_FIELD_MAP[f.name];
    if (mappedName) {
      fields.push({ name: mappedName, value: String(f.value), confidence: f.confidence });
    }
  }

  const firstLineItem = (extraction.lineItems && extraction.lineItems[0]) || [];
  for (const f of firstLineItem) {
    if (f.name === 'materialNumber') {
      fields.push({ name: 'productId', value: String(f.value), confidence: f.confidence });
    } else if (f.name === 'description') {
      fields.push({ name: 'issueDescription', value: String(f.value), confidence: f.confidence });
    }
  }

  return fields;
}

function mockExtraction() {
  return [
    { name: 'customerName', value: 'John Doe', confidence: 0.98 },
    { name: 'claimAmount', value: '25000', confidence: 0.95 },
    { name: 'productId', value: 'LAPTOP-001', confidence: 0.92 },
    { name: 'issueDescription', value: 'Screen not working after water damage', confidence: 0.88 }
  ];
}

async function extract({ buffer, fileName, mimeType }) {
  const start = Date.now();
  const fields = buffer && isConfigured()
    ? await extractFromBuffer(buffer, fileName, mimeType)
    : mockExtraction();

  return { fields, processingTimeMs: Date.now() - start };
}

module.exports = { extract, isConfigured };