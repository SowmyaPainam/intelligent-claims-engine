const cds = require('@sap/cds');
require('dotenv').config();
const multer = require('multer');

console.log('🚀 Starting Intelligent Claims Engine...');
console.log(`📅 Time: ${new Date().toISOString()}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

cds.on('bootstrap', (app) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
      cb(null, allowed.includes(file.mimetype));
    }
  });

  // Upload a claim document → extract fields → run the decision engine →
  // auto-create an approval workflow if escalated. One request, one result.
  app.post('/document/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'file is required (pdf, png, or jpg, max 10MB)' });
    }
    const { claimId } = req.body;
    if (!claimId) {
      return res.status(400).json({ error: 'claimId is required' });
    }

    try {
      const db = await cds.connect.to('db');
      const entities = cds.entities('intelligent.claims');
      const { extract } = require('./lib/die-client');
      const { persistExtraction } = require('./lib/document-persistence');

      const { fields, processingTimeMs } = await extract({
        buffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype
      });

      const actor = (req.user && req.user.id) || 'upload-endpoint';

      const { averageConfidence, claimUpdates } = await persistExtraction(db, entities, {
        claimId,
        fields,
        documentName: req.file.originalname,
        actor
      });

      const claimsSrv = await cds.connect.to('ClaimsService');
      const decision = await claimsSrv.send('ProcessClaim', { claimId });

      let approvalWorkflow = null;
      if (decision.decision === 'ESCALATE') {
        const approvalSrv = await cds.connect.to('ApprovalService');
        approvalWorkflow = await approvalSrv.send('CreateApprovalWorkflow', {
          claimId,
          riskLevel: decision.riskLevel
        });
      }

      res.json({
        claimId,
        fileName: req.file.originalname,
        extractedFields: fields,
        totalFields: fields.length,
        averageConfidence,
        claimUpdates,
        processingTimeMs,
        decision,
        approvalWorkflow
      });
    } catch (err) {
      console.error('❌ Document upload/extraction failed:', err);
      res.status(500).json({ error: 'Extraction failed', message: err.message });
    }
  });
});

cds.on('served', () => {
  console.log('\n✅ Intelligent Claims Engine is running!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 API Server: http://localhost:4004`);
  console.log(`📖 OData API:  http://localhost:4004/odata/`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

cds.on('error', (err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

module.exports = cds.server;