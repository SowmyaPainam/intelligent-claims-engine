const { v4: uuid } = require('uuid');

// Extracted field names that map directly onto Claims columns. Anything not
// in this list (e.g. a stray field name that happened to match "status") is
// ignored so extraction can never clobber workflow-controlled columns.
const CLAIM_FIELD_MAP = {
  customerName: 'customerName',
  customerEmail: 'customerEmail',
  claimAmount: 'claimAmount',
  currency: 'currency',
  productId: 'productId',
  productName: 'productName',
  issueDescription: 'issueDescription'
};

function mapFieldsToClaimUpdates(fields) {
  const updates = {};
  for (const field of fields) {
    const column = CLAIM_FIELD_MAP[field.name];
    if (column) {
      updates[column] = column === 'claimAmount' ? Number(field.value) : field.value;
    }
  }
  return updates;
}

async function persistExtraction(db, entities, { claimId, fields, documentName, actor }) {
  const { ExtractedData, Claims, AuditLog } = entities;

  for (const field of fields) {
    await db.run(
      INSERT.into(ExtractedData).entries([{
        ID: uuid(),
        claimID: claimId,
        fieldName: field.name,
        fieldValue: field.value,
        confidence: field.confidence
      }])
    );
  }

  const averageConfidence = fields.length
    ? (fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length) * 100
    : 0;

  const claimUpdates = {
    ...mapFieldsToClaimUpdates(fields),
    extractionConfidence: averageConfidence,
    ...(documentName ? { documentName } : {})
  };

  await db.run(UPDATE(Claims, claimId).set(claimUpdates));

  await db.run(
    INSERT.into(AuditLog).entries([{
      ID: uuid(),
      claimID: claimId,
      action: 'EXTRACTED',
      actor: actor || 'system',
      details: JSON.stringify({ fieldCount: fields.length, averageConfidence, mappedFields: Object.keys(claimUpdates) }),
      timestamp: new Date().toISOString(),
      status: 'SUCCESS'
    }])
  );

  return { averageConfidence, claimUpdates };
}

module.exports = { persistExtraction, mapFieldsToClaimUpdates };