// Audit Service - Logging and compliance tracking

const cds = require('@sap/cds');
const { v4: uuid } = require('uuid');

module.exports = cds.service.impl(async (srv) => {
  const db = await cds.connect.to('db');
  const { AuditLog, Claims, Approvals, ExtractedData } = cds.entities('intelligent.claims');

  // Get Audit Log for Claim
  srv.on('GetAuditLog', async (req) => {
    const { claimId, limit = 50 } = req.data;

    const auditLog = await db.run(
      SELECT.from(AuditLog)
        .where({ claimID: claimId })
        .orderBy('timestamp DESC')
        .limit(limit)
    );

    return {
      claimId,
      entries: auditLog,
      totalEntries: auditLog.length,
      lastUpdated: auditLog[0]?.timestamp || null
    };
  });

  // Get All Audit Logs
  srv.on('GetAllAuditLogs', async (req) => {
    const { action, actor, startDate, endDate, limit = 100 } = req.data;

    let query = SELECT.from(AuditLog).orderBy('timestamp DESC');

    if (action) {
      query = query.where({ action });
    }

    if (actor) {
      query = query.where({ actor });
    }

    const logs = await db.run(query.limit(limit));

    const summary = {};
    logs.forEach(log => {
      if (!summary[log.action]) {
        summary[log.action] = 0;
      }
      summary[log.action]++;
    });

    return {
      logs,
      totalLogs: logs.length,
      summary: JSON.stringify(summary),
      filters: {
        action,
        actor,
        startDate,
        endDate
      }
    };
  });

  // Get Claim History
  srv.on('GetClaimHistory', async (req) => {
    const { claimId } = req.data;

    const claim = await db.run(SELECT.one.from(Claims, claimId));
    if (!claim) {
      return req.error(404, 'Claim not found');
    }

    const auditLog = await db.run(
      SELECT.from(AuditLog)
        .where({ claimID: claimId })
        .orderBy('timestamp ASC')
    );

    const approvals = await db.run(
      SELECT.from(Approvals).where({ claimID: claimId })
    );

    const extractedData = await db.run(
      SELECT.from(ExtractedData).where({ claimID: claimId })
    );

    const timeline = [
      { type: 'CLAIM', data: claim },
      ...auditLog.map(log => ({ type: 'AUDIT', data: log })),
      ...approvals.map(app => ({ type: 'APPROVAL', data: app }))
    ].sort((a, b) => {
      const dateA = new Date(a.data.timestamp || a.data.createdAt);
      const dateB = new Date(b.data.timestamp || b.data.createdAt);
      return dateA - dateB;
    });

    return {
      claimId,
      claimDetails: claim,
      timeline: JSON.stringify(timeline),
      auditLog,
      approvals,
      extractedData,
      totalActions: auditLog.length
    };
  });

  // Export Audit Report
  srv.on('ExportAuditReport', async (req) => {
    const { startDate, endDate, format = 'json' } = req.data;

    let query = SELECT.from(AuditLog).orderBy('timestamp DESC');

    const logs = await db.run(query);

    const stats = {
      totalEntries: logs.length,
      dateRange: { startDate, endDate },
      actionSummary: {},
      actorSummary: {},
      statusSummary: {
        SUCCESS: logs.filter(l => l.status === 'SUCCESS').length,
        FAILED: logs.filter(l => l.status !== 'SUCCESS').length
      }
    };

    logs.forEach(log => {
      if (!stats.actionSummary[log.action]) {
        stats.actionSummary[log.action] = 0;
      }
      stats.actionSummary[log.action]++;

      if (!stats.actorSummary[log.actor]) {
        stats.actorSummary[log.actor] = 0;
      }
      stats.actorSummary[log.actor]++;
    });

    return {
      report: logs,
      statistics: JSON.stringify(stats),
      exportedAt: new Date().toISOString()
    };
  });

  // Get Compliance Report
  srv.on('GetComplianceReport', async (req) => {
    const { claimId } = req.data;

    const claim = await db.run(SELECT.one.from(Claims, claimId));
    if (!claim) {
      return req.error(404, 'Claim not found');
    }

    const auditLog = await db.run(
      SELECT.from(AuditLog).where({ claimID: claimId })
    );

    return {
      claimId,
      claimStatus: claim.status,
      isCompliant: auditLog.length > 0 && auditLog.every(l => l.status === 'SUCCESS'),
      hasCompleteAuditTrail: auditLog.length >= 3,
      hasApprovals: auditLog.some(l => l.action === 'APPROVED'),
      hasBudgetCheck: auditLog.some(l => l.action === 'BUDGET_CHECKED'),
      auditTrailEntries: auditLog.length,
      lastAuditAction: auditLog.length > 0 ? auditLog[auditLog.length - 1].action : null,
      lastAuditTime: auditLog.length > 0 ? auditLog[auditLog.length - 1].timestamp : null,
      complianceStatus: auditLog.every(l => l.status === 'SUCCESS') ? 'COMPLIANT' : 'NON_COMPLIANT'
    };
  });

  // Log Action
  srv.on('LogAction', async (req) => {
    const { claimId, action, actor, details, status } = req.data;

    const entry = {
      ID: uuid(),
      claimID: claimId,
      action,
      actor: actor || req.user.id,
      details: JSON.stringify(details || {}),
      timestamp: new Date().toISOString(),
      status: status || 'SUCCESS'
    };

    await db.run(INSERT.into(AuditLog).entries([entry]));

    return {
      status: 'LOGGED',
      entry
    };
  });
});