using { intelligent.claims as my } from '../db/schema';

service ClaimsService @(path: '/claims') {
  entity Claims    as projection on my.Claims;
  entity Budgets   as projection on my.Budgets;
  entity Approvals as projection on my.Approvals;
  entity AuditLog  as projection on my.AuditLog;

  action ProcessClaim(claimId: UUID) returns {
    claimId        : UUID;
    decision       : String;
    reason         : String;
    processingTime : Decimal;
    riskLevel      : String;
  };

  function GetClaimStatus(claimId: UUID) returns {
    claimId   : UUID;
    status    : String;
    amount    : Decimal;
    decision  : String;
    approvals : many {
      ID         : UUID;
      level      : Integer;
      levelName  : String;
      assignedTo : String;
      decision   : String;
      comments   : String;
    };
    auditLog : many {
      ID        : UUID;
      action    : String;
      actor     : String;
      details   : String;
      timestamp : Timestamp;
      status    : String;
    };
  };

  function ListClaims(status: String, limit: Integer, skip: Integer) returns {
    claims : many {
      ID               : UUID;
      documentName     : String;
      customerName     : String;
      customerEmail    : String;
      productId        : String;
      productName      : String;
      issueDescription : String;
      claimAmount      : Decimal;
      currency         : String;
      status           : String;
      decisionReason   : String;
      decisionTime     : Timestamp;
      processedBy      : String;
    };
    total : Integer;
    limit : Integer;
    skip  : Integer;
  };
}