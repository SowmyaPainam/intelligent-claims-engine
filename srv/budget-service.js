// Budget Service - Budget management

const cds = require('@sap/cds');
const { v4: uuid } = require('uuid');
const Validators = require('./lib/validators');

module.exports = cds.service.impl(async (srv) => {
  const db = await cds.connect.to('db');
  const { Budgets } = cds.entities('intelligent.claims');

  // Get Budget
  srv.on('READ', 'Budgets', async (req) => {
    return await db.run(req.query);
  });

  // Create Budget
  srv.on('CREATE', 'Budgets', async (req) => {
    const budget = req.data;

    const validation = Validators.validateBudget(budget);
    if (!validation.isValid) {
      return req.error(400, 'Validation failed: ' + validation.errors.join(', '));
    }

    budget.ID = uuid();
    budget.usedBudget = 0;
    budget.remainingBudget = budget.totalBudget;

    console.log('💰 Creating budget for:', budget.department);

    await db.run(INSERT.into(Budgets).entries([budget]));

    console.log('✅ Budget created');
    return budget;
  });

  // Update Budget After Approval
  srv.on('UpdateBudgetAfterApproval', async (req) => {
    const { claimId, amount } = req.data;

    console.log(`📊 Updating budget after claim ${claimId}`);

    const budget = await db.run(
      SELECT.one.from(Budgets).where({ department: 'Claims' })
    );

    if (!budget) {
      return req.error(404, 'Budget not found');
    }

    const newUsedBudget = budget.usedBudget + amount;
    const newRemainingBudget = budget.totalBudget - newUsedBudget;

    if (newRemainingBudget < 0) {
      return req.error(400, 'Budget limit exceeded');
    }

    await db.run(
      UPDATE(Budgets, budget.ID).set({
        usedBudget: newUsedBudget,
        remainingBudget: newRemainingBudget
      })
    );

    console.log('✅ Budget updated');

    return {
      previousUsed: budget.usedBudget,
      newUsed: newUsedBudget,
      previousRemaining: budget.remainingBudget,
      newRemaining: newRemainingBudget,
      percentageUsed: ((newUsedBudget / budget.totalBudget) * 100).toFixed(2)
    };
  });

  // Get Budget Status
  srv.on('GetBudgetStatus', async (req) => {
    const { department } = req.data;

    const budget = await db.run(
      SELECT.one.from(Budgets).where({ department: department || 'Claims' })
    );

    if (!budget) {
      return req.error(404, 'Budget not found');
    }

    const percentageUsed = ((budget.usedBudget / budget.totalBudget) * 100).toFixed(2);
    const percentageRemaining = (100 - percentageUsed).toFixed(2);
    const isLowBudget = percentageRemaining < budget.warningThreshold;

    return {
      department: budget.department,
      totalBudget: budget.totalBudget,
      usedBudget: budget.usedBudget,
      remainingBudget: budget.remainingBudget,
      percentageUsed: parseFloat(percentageUsed),
      percentageRemaining: parseFloat(percentageRemaining),
      warningThreshold: budget.warningThreshold,
      isLowBudget: isLowBudget,
      status: isLowBudget ? 'WARNING' : 'HEALTHY'
    };
  });

  // Check Budget Availability
  srv.on('CheckBudget', async (req) => {
    const { claimAmount, department } = req.data;

    const budget = await db.run(
      SELECT.one.from(Budgets).where({ department: department || 'Claims' })
    );

    if (!budget) {
      return req.error(404, 'Budget not found');
    }

    const canAllocate = budget.remainingBudget >= claimAmount;
    const percentageAfter = (((budget.usedBudget + claimAmount) / budget.totalBudget) * 100).toFixed(2);

    return {
      canAllocate: canAllocate,
      requestedAmount: claimAmount,
      remainingBudget: budget.remainingBudget,
      percentageAfter: parseFloat(percentageAfter),
      message: canAllocate ? 'Budget available' : 'Insufficient budget'
    };
  });

  // Get All Budgets
  srv.on('GetAllBudgets', async (req) => {
    const budgets = await db.run(SELECT.from(Budgets));

    const summary = budgets.map(b => ({
      department: b.department,
      totalBudget: b.totalBudget,
      usedBudget: b.usedBudget,
      remainingBudget: b.remainingBudget,
      percentageUsed: ((b.usedBudget / b.totalBudget) * 100).toFixed(2),
      status: b.remainingBudget > (b.totalBudget * b.warningThreshold / 100) ? 'HEALTHY' : 'WARNING'
    }));

    return {
      budgets: summary,
      totalBudgetAllDepts: budgets.reduce((sum, b) => sum + b.totalBudget, 0),
      totalUsedAllDepts: budgets.reduce((sum, b) => sum + b.usedBudget, 0),
      totalRemainingAllDepts: budgets.reduce((sum, b) => sum + b.remainingBudget, 0)
    };
  });
});