namespace intelligent.claims;

using { cuid, managed } from '@sap/cds/common';

// Users Table
entity Users : cuid, managed {
  email: String;
  name: String;
  role: String enum {
    ADMIN;
    SUPPORT_LEAD;
    FINANCE_MANAGER;
    DIRECTOR;
  };
  department: String;
  isActive: Boolean default true;
}

// Budgets Table
entity Budgets : cuid, managed {
  department: String;
  totalBudget: Decimal(12, 2);
  allocatedBudget: Decimal(12, 2);
  usedBudget: Decimal(12, 2) default 0;
  remainingBudget: Decimal(12, 2);
  warningThreshold: Decimal(5, 2) default 20.00;
  fiscalYear: Integer;
  currency: String default 'INR';
}

// Claims Table - Main Entity
entity Claims : cuid, managed {
  documentName: String;
  customerName: String;
  customerEmail: String;
  productId: String;
  productName: String;
  issueDescription: String;
  claimAmount: Decimal(12, 2);
  currency: String default 'INR';
  extractionConfidence: Decimal(5, 2);
  
  status: String enum {
    PENDING;
    AUTO_APPROVED;
    ESCALATED;
    APPROVED;
    REJECTED;
  } default 'PENDING';
  
  decisionReason: String;
  decisionTime: Timestamp;
  processedBy: String;
}

// Approvals Table
entity Approvals : cuid, managed {
  claimID: UUID;
  level: Integer;
  levelName: String enum {
    SUPPORT_LEAD;
    FINANCE_MANAGER;
    DIRECTOR;
  };
  assignedTo: String;
  decision: String enum {
    PENDING;
    APPROVED;
    REJECTED;
  } default 'PENDING';
  comments: String;
  decisionAt: Timestamp;
  decisionBy: String;
}

// Audit Log Table
entity AuditLog : cuid, managed {
  claimID: UUID;
  action: String enum {
    CREATED;
    EXTRACTED;
    VALIDATED;
    DECISION_MADE;
    APPROVED;
    REJECTED;
    ESCALATED;
    BUDGET_CHECKED;
    BUDGET_UPDATED;
  };
  actor: String;
  details: String;
  timestamp: Timestamp;
  status: String;
}

// Extracted Data Table
entity ExtractedData : cuid, managed {
  claimID: UUID;
  fieldName: String;
  fieldValue: String;
  confidence: Decimal(5, 2);
  validated: Boolean default false;
  validatedBy: String;
  validationNotes: String;
}

// Decision Metrics Table
entity DecisionMetrics : cuid, managed {
  month: String;
  year: Integer;
  totalClaims: Integer;
  autoApprovedCount: Integer;
  escalatedCount: Integer;
  approvedCount: Integer;
  rejectedCount: Integer;
  averageProcessingTime: Decimal(8, 2);
  accuracyRate: Decimal(5, 2);
  budgetComplianceRate: Decimal(5, 2);
  totalClaimsAmount: Decimal(14, 2);
  totalApprovedAmount: Decimal(14, 2);
}