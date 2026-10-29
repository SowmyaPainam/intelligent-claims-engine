// Claims Service - Main claim processing

const cds = require('@sap/cds');
const { v4: uuid } = require('uuid');
const Validators = require('./lib/validators');
const Helpers = require('./lib/helpers');
const { processClaim } = require('./lib/claim-processor');

module.exports = cds.service.impl(async (srv) => {
  const db = await cds.connect.to('db');
  const { Claims, Budgets, Approvals, AuditLog } = cds.entities('intelligent.claims');

  // Create Claim
  srv.on('CREATE', 'Claims', async (req) => {
    const claim = req.data;

    const validation = Validators.validateClaim(claim);
    if (!validation.isValid) {
      return req.error(400, 'Validation failed: ' + validation.errors.join(', '));
    }

    claim.ID = uuid();
    claim.status = 'PENDING';

    console.log('📝 Creating claim:', claim.ID);

    await db.run(INSERT.into(Claims).entries([claim]));

    await db.run(
      INSERT.into(AuditLog).entries([{
        ID: uuid(),
        claimID: claim.ID,
        action: 'CREATED',
        actor: req.user.id,
        details: JSON.stringify({ documentName: claim.documentName }),
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      }])
    );

    console.log('✅ Claim created:', claim.ID);
    return claim;
  });

  // Read Claims
  srv.on('READ', 'Claims', async (req) => {
    return await db.run(req.query);
  });

  // Update Claim
  srv.on('UPDATE', 'Claims', async (req) => {
    const claim = req.data;

    await db.run(UPDATE(Claims, claim.ID).set(claim));

    await db.run(
      INSERT.into(AuditLog).entries([{
        ID: uuid(),
        claimID: claim.ID,
        action: 'UPDATED',
        actor: req.user.id,
        details: JSON.stringify(claim),
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      }])
    );

    return claim;
  });

  // Process Claim
  srv.on('ProcessClaim', async (req) => {
    const { claimId } = req.data;
    console.log('🔄 Processing claim:', claimId);

    try {
      const decision = await processClaim(db, { Claims, Budgets, AuditLog }, claimId, req.user.id);
      console.log('⚡ Decision:', decision.decision);
      return { claimId, ...decision };
    } catch (err) {
      return req.error(404, err.message);
    }
  });

  // Get Claim Status
  srv.on('GetClaimStatus', async (req) => {
    const { claimId } = req.data;

    const claim = await db.run(SELECT.one.from(Claims, claimId));
    if (!claim) {
      return req.error(404, 'Claim not found');
    }

    const approvals = await db.run(
      SELECT.from(Approvals).where({ claimID: claimId })
    );

    const auditLog = await db.run(
      SELECT.from(AuditLog).where({ claimID: claimId })
    );

    return {
      claimId,
      status: claim.status,
      amount: claim.claimAmount,
      decision: claim.decisionReason,
      approvals,
      auditLog
    };
  });

  // List Claims
  srv.on('ListClaims', async (req) => {
    const { status, limit = 10, skip = 0 } = req.data;

    let query = SELECT.from(Claims);

    if (status) {
      query = query.where({ status });
    }

    const claims = await db.run(query.limit(limit).offset(skip));

    return {
      claims,
      total: claims.length,
      limit,
      skip
    };
  });
});