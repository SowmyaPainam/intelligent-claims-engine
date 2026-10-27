require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/test-die-raw.js <path-to-file>');
    process.exit(1);
  }

  console.log('Getting token...');
  const tokenResp = await axios.post(`${process.env.DIE_UAA_URL}/oauth/token`, null, {
    params: { grant_type: 'client_credentials' },
    auth: { username: process.env.DIE_CLIENT_ID, password: process.env.DIE_CLIENT_SECRET }
  });
  const token = tokenResp.data.access_token;
  console.log('Got token.');

  const buffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append('options', JSON.stringify({ schemaName: 'SAP_invoice_schema', clientId: 'default' }));
  form.append('fileType', 'document');
  form.append('file', buffer, { filename: path.basename(filePath) });

  const submit = await axios.post(`${process.env.DIE_SERVICE_URL}/document-information-extraction/v1/document/jobs`, form, {
    headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
  });
  const jobId = submit.data.id;
  console.log('Submitted job:', jobId);

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const status = await axios.get(`${process.env.DIE_SERVICE_URL}/document-information-extraction/v1/document/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', status.data.status);
    if (status.data.status === 'DONE' || status.data.status === 'FAILED') {
      console.log(JSON.stringify(status.data, null, 2));
      return;
    }
  }
  console.log('Timed out.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  if (err.response) {
    console.error('Status:', err.response.status);
    console.error('Data:', JSON.stringify(err.response.data, null, 2));
  }
});