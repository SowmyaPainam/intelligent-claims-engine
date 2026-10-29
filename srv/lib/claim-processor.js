const cds = require('@sap/cds');
const { v4: uuid } = require('uuid');
const DecisionEngine = require('./decision-engine');

async function processClaim(db, entities, claimId, actor) {
  const { Claims, Budgets, AuditLog } = entities;

  const claim = await db.run(SELECT.one.from(Claims, claimId));
  if (!claim) {
    throw new Error('Claim not found');
  }

  const budget = await db.run(
    SELECT.one.from(Budgets).where({ department: 'Claims' })
  );
  if (!budget) {
    throw new Error('Budget not found');
  }

  const decision = DecisionEngine.makeDecision(claim, budget);

  await db.run(
    UPDATE(Claims, claimId).set({
      status: decision.decision === 'AUTO_APPROVE' ? 'AUTO_APPROVED' : 'ESCALATED',
      decisionReason: decision.reason,
      decisionTime: new Date().toISOString(),
      processedBy: actor
    })
  );

  await db.run(
    INSERT.into(AuditLog).entries([{
      ID: uuid(),
      claimID: claimId,
      action: 'DECISION_MADE',
      actor,
      details: JSON.stringify(decision),
      timestamp: new Date().toISOString(),
      status: 'SUCCESS'
    }])
  );

  return decision;
}

module.exports = { processClaim };