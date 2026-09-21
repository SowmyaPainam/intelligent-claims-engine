using { intelligent.claims as my } from '../db/schema';

service ApprovalService @(path: '/approval') {
  entity Approvals as projection on my.Approvals;
  entity Claims    as projection on my.Claims;
  entity AuditLog  as projection on my.AuditLog;

  action CreateApprovalWorkflow(claimId: UUID, riskLevel: String) returns {
    claimId    : UUID;
    workflowId : UUID;
    levels     : Integer;
    approvals  : many {
      ID        : UUID;
      claimID   : UUID;
      level     : Integer;
      levelName : String;
      decision  : String;
    };
  };

  function GetApprovalTasks(userId: String, level: Integer) returns {
    userId     : String;
    level      : Integer;
    totalTasks : Integer;
    tasks      : many {
      ID        : UUID;
      claimID   : UUID;
      level     : Integer;
      levelName : String;
      decision  : String;
    };
  };

  action SubmitApprovalDecision(approvalId: UUID, claimId: UUID, level: Integer, decision: String, comments: String) returns {
    approvalId : UUID;
    claimId    : UUID;
    level      : Integer;
    decision   : String;
    message    : String;
  };

  function GetApprovalStatus(claimId: UUID) returns {
    claimId        : UUID;
    status         : String;
    totalApprovals : Integer;
    approvedCount  : Integer;
    rejectedCount  : Integer;
    pendingCount   : Integer;
    approvals      : many {
      ID        : UUID;
      claimID   : UUID;
      level     : Integer;
      levelName : String;
      decision  : String;
      comments  : String;
    };
  };

  action RejectApproval(approvalId: UUID, claimId: UUID, reason: String) returns {
    claimId : UUID;
    status  : String;
    reason  : String;
    message : String;
  };
}
