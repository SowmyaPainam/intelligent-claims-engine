// Document Service - Document AI integration

const cds = require('@sap/cds');
const { v4: uuid } = require('uuid');

module.exports = cds.service.impl(async (srv) => {
  const db = await cds.connect.to('db');
  const { ExtractedData, Claims, AuditLog } = cds.entities('intelligent.claims');

  // Extract From Document (Mock DIE)
  srv.on('ExtractFromDocument', async (req) => {
    const { claimId, documentPath, documentType } = req.data;

    console.log(`📄 Extracting data from document: ${documentPath}`);

    const mockExtractionResult = {
      fields: [
        { name: 'customerName', value: 'John Doe', confidence: 0.98 },
        { name: 'claimAmount', value: '25000', confidence: 0.95 },
        { name: 'productId', value: 'LAPTOP-001', confidence: 0.92 },
        { name: 'issueDescription', value: 'Screen not working after water damage', confidence: 0.88 }
      ],
      pageCount: 1,
      processingTimeMs: 1250,
      confidence: 0.93
    };

    for (const field of mockExtractionResult.fields) {
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

    const avgConfidence = (
      mockExtractionResult.fields.reduce((sum, f) => sum + f.confidence, 0) /
      mockExtractionResult.fields.length * 100
    );

    await db.run(
      UPDATE(Claims, claimId).set({
        extractionConfidence: avgConfidence
      })
    );

    console.log(`✅ Extraction complete, confidence: ${avgConfidence.toFixed(2)}%`);

    return {
      claimId,
      extractedFields: mockExtractionResult.fields,
      totalFields: mockExtractionResult.fields.length,
      averageConfidence: avgConfidence,
      processingTimeMs: mockExtractionResult.processingTimeMs
    };
  });

  // Validate Extracted Data
  srv.on('ValidateExtractedData', async (req) => {
    const { claimId } = req.data;

    const extractedData = await db.run(
      SELECT.from(ExtractedData).where({ claimID: claimId })
    );

    if (!extractedData || extractedData.length === 0) {
      return req.error(404, 'No extracted data found');
    }

    const result = {
      claimId,
      validated: {
        fields: [],
        needsReview: [],
        invalid: []
      }
    };

    for (const field of extractedData) {
      if (field.confidence >= 0.9) {
        result.validated.fields.push(field);
      } else if (field.confidence >= 0.7) {
        result.validated.needsReview.push(field);
      } else {
        result.validated.invalid.push(field);
      }

      await db.run(
        UPDATE(ExtractedData, field.ID).set({
          validated: true,
          validatedBy: req.user.id
        })
      );
    }

    await db.run(
      INSERT.into(AuditLog).entries([{
        ID: uuid(),
        claimID: claimId,
        action: 'VALIDATED',
        actor: req.user.id,
        details: JSON.stringify(result),
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      }])
    );

    console.log(`✅ Validation complete for claim ${claimId}`);

    return result;
  });

  // Get Extracted Data
  srv.on('GetExtractedData', async (req) => {
    const { claimId } = req.data;

    const extractedData = await db.run(
      SELECT.from(ExtractedData).where({ claimID: claimId })
    );

    return {
      claimId,
      data: extractedData,
      count: extractedData.length
    };
  });

  // Update Extracted Field
  srv.on('UpdateExtractedField', async (req) => {
    const { fieldId, newValue, note } = req.data;

    console.log(`🔧 Updating field ${fieldId} to: ${newValue}`);

    await db.run(
      UPDATE(ExtractedData, fieldId).set({
        fieldValue: newValue,
        validationNotes: note,
        validatedBy: req.user.id
      })
    );

    console.log(`✅ Field updated`);

    return {
      fieldId,
      newValue,
      status: 'UPDATED'
    };
  });

  // Get Document Status
  srv.on('GetDocumentStatus', async (req) => {
    const { claimId } = req.data;

    const claim = await db.run(SELECT.one.from(Claims, claimId));
    if (!claim) {
      return req.error(404, 'Claim not found');
    }

    const extractedData = await db.run(
      SELECT.from(ExtractedData).where({ claimID: claimId })
    );

    return {
      claimId,
      documentName: claim.documentName,
      extractionConfidence: claim.extractionConfidence,
      extractedFieldsCount: extractedData.length,
      validatedFieldsCount: extractedData.filter(f => f.validated).length,
      status: claim.status,
      processingStatus: claim.extractionConfidence >= 0.9 ? 'COMPLETE' : 'NEEDS_REVIEW'
    };
  });
});