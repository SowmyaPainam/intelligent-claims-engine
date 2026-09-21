using { intelligent.claims as my } from '../db/schema';

service AuditService @(path: '/audit') {
  entity AuditLog      as projection on my.AuditLog;
  entity Claims        as projection on my.Claims;
  entity Approvals     as projection on my.Approvals;
  entity ExtractedData as projection on my.ExtractedData;

  function GetAuditLog(claimId: UUID, limit: Integer) returns {
    claimId      : UUID;
    entries      : many {
      ID        : UUID;
      claimID   : UUID;
      action    : String;
      actor     : String;
      details   : String;
      timestamp : Timestamp;
      status    : String;
    };
    totalEntries : Integer;
    lastUpdated  : Timestamp;
  };

  function GetAllAuditLogs(action: String, actor: String, startDate: String, endDate: String, limit: Integer) returns {
    logs      : many {
      ID        : UUID;
      claimID   : UUID;
      action    : String;
      actor     : String;
      details   : String;
      timestamp : Timestamp;
      status    : String;
    };
    totalLogs : Integer;
    summary   : LargeString;
    filters   : {
      action    : String;
      actor     : String;
      startDate : String;
      endDate   : String;
    };
  };

  function GetClaimHistory(claimId: UUID) returns {
    claimId       : UUID;
    claimDetails  : {
      ID             : UUID;
      documentName   : String;
      customerName   : String;
      claimAmount    : Decimal;
      status         : String;
      decisionReason : String;
    };
    timeline      : LargeString;
    auditLog      : many {
      ID        : UUID;
      action    : String;
      actor     : String;
      timestamp : Timestamp;
      status    : String;
    };
    approvals     : many {
      ID        : UUID;
      level     : Integer;
      levelName : String;
      decision  : String;
    };
    extractedData : many {
      ID         : UUID;
      fieldName  : String;
      fieldValue : String;
      confidence : Decimal;
      validated  : Boolean;
    };
    totalActions  : Integer;
  };

  function ExportAuditReport(startDate: String, endDate: String, format: String) returns {
    report     : many {
      ID        : UUID;
      claimID   : UUID;
      action    : String;
      actor     : String;
      timestamp : Timestamp;
      status    : String;
    };
    statistics : LargeString;
    exportedAt : Timestamp;
  };

  function GetComplianceReport(claimId: UUID) returns {
    claimId               : UUID;
    claimStatus           : String;
    isCompliant           : Boolean;
    hasCompleteAuditTrail : Boolean;
    hasApprovals          : Boolean;
    hasBudgetCheck        : Boolean;
    auditTrailEntries     : Integer;
    lastAuditAction       : String;
    lastAuditTime         : Timestamp;
    complianceStatus      : String;
  };

  action LogAction(claimId: UUID, action: String, actor: String, details: String, status: String) returns {
    status : String;
    entry  : {
      ID        : UUID;
      claimID   : UUID;
      action    : String;
      actor     : String;
      details   : String;
      timestamp : Timestamp;
      status    : String;
    };
  };
}
