class DecisionEngine {
  static SAFE_CLAIM_LIMIT = 15000;
  static WARNING_THRESHOLD = 20;

  static makeDecision(claim, budget) {
    if (!claim || !budget) {
      throw new Error('Invalid claim or budget object');
    }

    const claimAmount = claim.claimAmount || 0;
    const remainingBudget = budget.remainingBudget || 0;
    const totalBudget = budget.totalBudget || 0;
    const isSafeAmount = claimAmount <= this.SAFE_CLAIM_LIMIT;
    const isSafeBudget = remainingBudget > (totalBudget * this.WARNING_THRESHOLD / 100);

    let decision, reason, processingTime, riskLevel;

    if (isSafeAmount && isSafeBudget) {
      decision = 'AUTO_APPROVE';
      reason = 'Low amount and sufficient budget available';
      processingTime = 2;
      riskLevel = 'LOW';
    } else if (!isSafeAmount && !isSafeBudget) {
      decision = 'ESCALATE';
      reason = 'High amount AND low budget - requires all approvals';
      processingTime = 240;
      riskLevel = 'CRITICAL';
    } else if (!isSafeAmount) {
      decision = 'ESCALATE';
      reason = 'High claim amount - requires approval';
      processingTime = 120;
      riskLevel = 'HIGH';
    } else {
      decision = 'ESCALATE';
      reason = 'Low budget remaining - requires budget approval';
      processingTime = 120;
      riskLevel = 'MEDIUM';
    }

    return {
      decision,
      reason,
      processingTime,
      riskLevel,
      claimAmount,
      remainingBudget,
      budgetPercentageUsed: ((totalBudget - remainingBudget) / totalBudget * 100).toFixed(2),
      timestamp: new Date().toISOString()
    };
  }

  static calculateBudgetImpact(claim, budget) {
    const newUsedBudget = (budget.usedBudget || 0) + claim.claimAmount;
    const newRemainingBudget = budget.totalBudget - newUsedBudget;
    const percentageUsed = (newUsedBudget / budget.totalBudget * 100).toFixed(2);

    return {
      currentUsed: budget.usedBudget,
      newUsed: newUsedBudget,
      currentRemaining: budget.remainingBudget,
      newRemaining: newRemainingBudget,
      percentageUsed,
      willExceedBudget: newRemainingBudget < 0
    };
  }
}

module.exports = DecisionEngine;