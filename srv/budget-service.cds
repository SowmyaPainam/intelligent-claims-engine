using { intelligent.claims as my } from '../db/schema';

service BudgetService @(path: '/budget') {
  entity Budgets as projection on my.Budgets;

  action UpdateBudgetAfterApproval(claimId: UUID, amount: Decimal) returns {
    previousUsed      : Decimal;
    newUsed           : Decimal;
    previousRemaining : Decimal;
    newRemaining      : Decimal;
    percentageUsed    : String;
  };

  function GetBudgetStatus(department: String) returns {
    department          : String;
    totalBudget         : Decimal;
    usedBudget          : Decimal;
    remainingBudget     : Decimal;
    percentageUsed      : Decimal;
    percentageRemaining : Decimal;
    warningThreshold    : Decimal;
    isLowBudget         : Boolean;
    status              : String;
  };

  function CheckBudget(claimAmount: Decimal, department: String) returns {
    canAllocate     : Boolean;
    requestedAmount : Decimal;
    remainingBudget : Decimal;
    percentageAfter : Decimal;
    message         : String;
  };

  function GetAllBudgets() returns {
    budgets : many {
      department      : String;
      totalBudget     : Decimal;
      usedBudget      : Decimal;
      remainingBudget : Decimal;
      percentageUsed  : String;
      status          : String;
    };
    totalBudgetAllDepts    : Decimal;
    totalUsedAllDepts      : Decimal;
    totalRemainingAllDepts : Decimal;
  };
}
