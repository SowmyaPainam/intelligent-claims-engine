const DecisionEngine = require('../srv/lib/decision-engine');

describe('DecisionEngine.makeDecision', () => {
  const healthyBudget = { totalBudget: 100000, remainingBudget: 80000 };
  const lowBudget = { totalBudget: 100000, remainingBudget: 15000 };

  test('auto-approves a low amount with a healthy budget', () => {
    const result = DecisionEngine.makeDecision({ claimAmount: 5000 }, healthyBudget);
    expect(result.decision).toBe('AUTO_APPROVE');
    expect(result.riskLevel).toBe('LOW');
  });

  test('escalates a high amount even with a healthy budget', () => {
    const result = DecisionEngine.makeDecision({ claimAmount: 20000 }, healthyBudget);
    expect(result.decision).toBe('ESCALATE');
    expect(result.riskLevel).toBe('HIGH');
  });

  test('escalates a low amount when budget is low', () => {
    const result = DecisionEngine.makeDecision({ claimAmount: 5000 }, lowBudget);
    expect(result.decision).toBe('ESCALATE');
    expect(result.riskLevel).toBe('MEDIUM');
  });

  test('escalates as CRITICAL when amount is high AND budget is low', () => {
    const result = DecisionEngine.makeDecision({ claimAmount: 20000 }, lowBudget);
    expect(result.decision).toBe('ESCALATE');
    expect(result.riskLevel).toBe('CRITICAL');
  });

  test('treats exactly the safe amount limit (15000) as safe', () => {
    const result = DecisionEngine.makeDecision({ claimAmount: 15000 }, healthyBudget);
    expect(result.decision).toBe('AUTO_APPROVE');
  });

  test('treats one rupee over the safe limit as unsafe', () => {
    const result = DecisionEngine.makeDecision({ claimAmount: 15001 }, healthyBudget);
    expect(result.decision).toBe('ESCALATE');
  });

  test('treats remaining budget exactly at the 20% threshold as unsafe (strict greater-than)', () => {
    const budget = { totalBudget: 100000, remainingBudget: 20000 };
    const result = DecisionEngine.makeDecision({ claimAmount: 5000 }, budget);
    expect(result.decision).toBe('ESCALATE');
    expect(result.riskLevel).toBe('MEDIUM');
  });

  test('throws when claim or budget is missing', () => {
    expect(() => DecisionEngine.makeDecision(null, healthyBudget)).toThrow();
    expect(() => DecisionEngine.makeDecision({ claimAmount: 100 }, null)).toThrow();
  });
});