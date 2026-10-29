const { extract, isConfigured } = require('../srv/lib/die-client');

describe('die-client mock fallback', () => {
  beforeEach(() => {
    delete process.env.DIE_UAA_URL;
    delete process.env.DIE_CLIENT_ID;
    delete process.env.DIE_CLIENT_SECRET;
    delete process.env.DIE_SERVICE_URL;
  });

  test('isConfigured is false when DIE env vars are missing', () => {
    expect(isConfigured()).toBe(false);
  });

  test('falls back to mock fields when DIE is not configured', async () => {
    const { fields } = await extract({
      buffer: Buffer.from('fake'),
      fileName: 'test.pdf',
      mimeType: 'application/pdf'
    });
    const names = fields.map((f) => f.name);
    expect(names).toEqual(expect.arrayContaining(['customerName', 'claimAmount', 'productId', 'issueDescription']));
  });

  test('falls back to mock fields when there is no file buffer at all', async () => {
    const { fields } = await extract({ buffer: null, fileName: null, mimeType: null });
    expect(fields.length).toBeGreaterThan(0);
  });
});