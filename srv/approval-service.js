// Approval Service - Manages approval workflows

const cds = require('@sap/cds');
const { v4: uuid } = require('uuid');

module.exports = cds.service.impl(async (srv) => {
  const db = await cds.connect.to('db');
  const { Approvals, Claims, Budgets, AuditLog } = cds.entities('intelligent.claims');

  // Create Approval Workflow
  srv.on('CreateApprovalWorkflow', async (req) => {
    const { claimId, riskLevel } = req.data;

    console.log(`📋 Creating approval workflow for claim ${claimId}, risk: ${riskLevel}`);

    const levels = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 2,
      'CRITICAL': 3
    };

    const numLevels = levels[riskLevel] || 1;
    const levelNames = ['SUPPORT_LEAD', 'FINANCE_MANAGER', 'DIRECTOR'];

    const approvals = [];
    for (let i = 1; i <= numLevels; i++) {
      approvals.push({
        ID: uuid(),
        claimID: claimId,
        level: i,
        levelName: levelNames[i - 1],
        decision: 'PENDING'
      });
    }

    await db.run(INSERT.into(Approvals).entries(approvals));

    console.log(`✅ Workflow created with ${numLevels} levels`);

    return {
      claimId,
      workflowId: uuid(),
      levels: numLevels,
      approvals
    };
  });

  // Get Approval Tasks for User
  srv.on('GetApprovalTasks', async (req) => {
    const { userId, level } = req.data;

    let query = SELECT.from(Approvals).where({ decision: 'PENDING' });

    if (level) {
      query = query.where({ level: level });
    }

    const tasks = await db.run(query);

    return {
      userId,
      level,
      totalTasks: tasks.length,
      tasks: tasks
    };
  });

    // Submit Approval Decision
  srv.on('SubmitApprovalDecision', async (req) => {
    const { approvalId, claimId, level, decision, comments } = req.data;

    console.log(`📝 Submitting approval for claim ${claimId}, level ${level}: ${decision}`);

    await db.run(
      UPDATE(Approvals, approvalId).set({
        decision: decision,
        comments: comments,
        decisionAt: new Date().toISOString(),
        decisionBy: req.user.id
      })
    );

    await db.run(
      INSERT.into(AuditLog).entries([{
        ID: uuid(),
        claimID: claimId,
        action: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        actor: req.user.id,
        details: JSON.stringify({ level, decision, comments }),
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      }])
    );

    if (decision === 'REJECTED') {
      await db.run(UPDATE(Claims, claimId).set({ status: 'REJECTED' }));
    } else {
      const remainingApprovals = await db.run(
        SELECT.from(Approvals).where({ claimID: claimId, decision: 'PENDING' })
      );

      if (remainingApprovals.length === 0) {
        const claim = await db.run(SELECT.one.from(Claims, claimId));
        const budget = await db.run(
          SELECT.one.from(Budgets).where({ department: 'Claims' })
        );

        if (budget) {
          const newUsedBudget = budget.usedBudget + claim.claimAmount;
          const newRemainingBudget = budget.totalBudget - newUsedBudget;

          await db.run(
            UPDATE(Budgets, budget.ID).set({
              usedBudget: newUsedBudget,
              remainingBudget: newRemainingBudget
            })
          );

          await db.run(
            INSERT.into(AuditLog).entries([{
              ID: uuid(),
              claimID: claimId,
              action: 'BUDGET_UPDATED',
              actor: req.user.id,
              details: JSON.stringify({ deductedAmount: claim.claimAmount, newRemainingBudget }),
              timestamp: new Date().toISOString(),
              status: 'SUCCESS'
            }])
          );
        }

        await db.run(UPDATE(Claims, claimId).set({ status: 'APPROVED' }));
      }
    }

    return {
      approvalId,
      claimId,
      level,
      decision,
      message: 'Approval decision recorded'
    };
  });
  // Submit Approval Decision
  // srv.on('SubmitApprovalDecision', async (req) => {
  //   const { approvalId, claimId, level, decision, comments } = req.data;

  //   console.log(`📝 Submitting approval for claim ${claimId}, level ${level}: ${decision}`);

  //   await db.run(
  //     UPDATE(Approvals, approvalId).set({
  //       decision: decision,
  //       comments: comments,
  //       decisionAt: new Date().toISOString(),
  //       decisionBy: req.user.id
  //     })
  //   );

  //   const currentApproval = await db.run(
  //     SELECT.one.from(Approvals, approvalId)
  //   );

  //   // if (decision === 'APPROVED' && currentApproval.level < 3) {
  //   //   const nextLevel = currentApproval.level + 1;
  //   //   const levelNames = ['SUPPORT_LEAD', 'FINANCE_MANAGER', 'DIRECTOR'];

  //   //   await db.run(
  //   //     INSERT.into(Approvals).entries([{
  //   //       ID: uuid(),
  //   //       claimID: claimId,
  //   //       level: nextLevel,
  //   //       levelName: levelNames[nextLevel - 1],
  //   //       decision: 'PENDING'
  //   //     }])
  //   //   );

  //   //   console.log(`✅ Next approval level created: ${levelNames[nextLevel - 1]}`);
  //   // }

  //   await db.run(
  //     INSERT.into(AuditLog).entries([{
  //       ID: uuid(),
  //       claimID: claimId,
  //       action: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
  //       actor: req.user.id,
  //       details: JSON.stringify({ level, decision, comments }),
  //       timestamp: new Date().toISOString(),
  //       status: 'SUCCESS'
  //     }])
  //   );

  //   return {
  //     approvalId,
  //     claimId,
  //     level,
  //     decision,
  //     message: 'Approval decision recorded'
  //   };
  // });

  // Get Approval Status
  srv.on('GetApprovalStatus', async (req) => {
    const { claimId } = req.data;

    const approvals = await db.run(
      SELECT.from(Approvals).where({ claimID: claimId })
    );

    let status = 'PENDING';
    let allApproved = true;
    let anyRejected = false;

    approvals.forEach(a => {
      if (a.decision === 'REJECTED') {
        anyRejected = true;
        allApproved = false;
      } else if (a.decision === 'PENDING') {
        allApproved = false;
      }
    });

    if (anyRejected) {
      status = 'REJECTED';
    } else if (allApproved && approvals.length > 0) {
      status = 'APPROVED';
    }

    return {
      claimId,
      status,
      totalApprovals: approvals.length,
      approvedCount: approvals.filter(a => a.decision === 'APPROVED').length,
      rejectedCount: approvals.filter(a => a.decision === 'REJECTED').length,
      pendingCount: approvals.filter(a => a.decision === 'PENDING').length,
      approvals
    };
  });

  // Reject Approval
  srv.on('RejectApproval', async (req) => {
    const { approvalId, claimId, reason } = req.data;

    console.log(`❌ Rejecting claim ${claimId}`);

    await db.run(
      UPDATE(Approvals, approvalId).set({
        decision: 'REJECTED',
        comments: reason,
        decisionAt: new Date().toISOString(),
        decisionBy: req.user.id
      })
    );

    await db.run(
      UPDATE(Claims, claimId).set({
        status: 'REJECTED'
      })
    );

    await db.run(
      INSERT.into(AuditLog).entries([{
        ID: uuid(),
        claimID: claimId,
        action: 'REJECTED',
        actor: req.user.id,
        details: JSON.stringify({ reason }),
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      }])
    );

    return {
      claimId,
      status: 'REJECTED',
      reason,
      message: 'Claim rejected'
    };
  });
});