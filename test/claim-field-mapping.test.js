const { mapFieldsToClaimUpdates } = require('../srv/lib/document-persistence');
const { mapInvoiceExtractionToClaimFields } = require('../srv/lib/die-client');

describe('mapFieldsToClaimUpdates', () => {
  test('maps known field names onto the correct claim columns', () => {
    const fields = [
      { name: 'customerName', value: 'John Doe', confidence: 0.9 },
      { name: 'claimAmount', value: '25000', confidence: 0.8 },
      { name: 'currency', value: 'INR', confidence: 0.95 }
    ];
    expect(mapFieldsToClaimUpdates(fields)).toEqual({
      customerName: 'John Doe',
      claimAmount: 25000,
      currency: 'INR'
    });
  });

  test('coerces claimAmount to a number', () => {
    const updates = mapFieldsToClaimUpdates([{ name: 'claimAmount', value: '5000', confidence: 1 }]);
    expect(updates.claimAmount).toBe(5000);
    expect(typeof updates.claimAmount).toBe('number');
  });

  test('ignores field names not in the whitelist (cannot clobber status or other columns)', () => {
    const updates = mapFieldsToClaimUpdates([
      { name: 'status', value: 'HACKED', confidence: 1 },
      { name: 'someRandomDieField', value: 'noise', confidence: 1 }
    ]);
    expect(updates).toEqual({});
  });

  test('returns an empty object for no fields', () => {
    expect(mapFieldsToClaimUpdates([])).toEqual({});
  });
});

describe('mapInvoiceExtractionToClaimFields (real SAP_invoice_schema shape, verified 2026-10-27)', () => {
  test('translates real DIE field names to canonical claim fields', () => {
    const extraction = {
      headerFields: [
        { name: 'grossAmount', value: 25000, confidence: 0.82 },
        { name: 'currencyCode', value: 'INR', confidence: 0.93 },
        { name: 'receiverContact', value: 'John Doe', confidence: 0.45 },
        { name: 'senderName', value: 'Some Vendor', confidence: 0.76 }
      ],
      lineItems: [[
        { name: 'materialNumber', value: 'LAPTOP-001', confidence: 0.70 },
        { name: 'description', value: 'Screen repair', confidence: 0.64 }
      ]]
    };

    const fields = mapInvoiceExtractionToClaimFields(extraction);
    const asMap = Object.fromEntries(fields.map((f) => [f.name, f.value]));

    expect(asMap).toEqual({
      claimAmount: '25000',
      currency: 'INR',
      customerName: 'John Doe',
      productId: 'LAPTOP-001',
      issueDescription: 'Screen repair'
    });
  });

  test('handles an extraction with no line items', () => {
    expect(mapInvoiceExtractionToClaimFields({ headerFields: [], lineItems: [] })).toEqual([]);
  });
});