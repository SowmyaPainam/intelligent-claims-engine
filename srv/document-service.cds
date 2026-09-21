using { intelligent.claims as my } from '../db/schema';

service DocumentService @(path: '/document') {
  entity ExtractedData as projection on my.ExtractedData;
  entity Claims        as projection on my.Claims;
  entity AuditLog      as projection on my.AuditLog;

  action ExtractFromDocument(claimId: UUID, documentPath: String, documentType: String) returns {
    claimId           : UUID;
    extractedFields   : many {
      name       : String;
      value      : String;
      confidence : Decimal;
    };
    totalFields       : Integer;
    averageConfidence : Decimal;
    processingTimeMs  : Integer;
  };

  action ValidateExtractedData(claimId: UUID) returns {
    claimId   : UUID;
    validated : {
      fields      : many { ID: UUID; fieldName: String; fieldValue: String; confidence: Decimal; };
      needsReview : many { ID: UUID; fieldName: String; fieldValue: String; confidence: Decimal; };
      invalid     : many { ID: UUID; fieldName: String; fieldValue: String; confidence: Decimal; };
    };
  };

  function GetExtractedData(claimId: UUID) returns {
    claimId : UUID;
    data    : many {
      ID              : UUID;
      fieldName       : String;
      fieldValue      : String;
      confidence      : Decimal;
      validated       : Boolean;
      validatedBy     : String;
      validationNotes : String;
    };
    count   : Integer;
  };

  action UpdateExtractedField(fieldId: UUID, newValue: String, note: String) returns {
    fieldId  : UUID;
    newValue : String;
    status   : String;
  };

  function GetDocumentStatus(claimId: UUID) returns {
    claimId              : UUID;
    documentName         : String;
    extractionConfidence : Decimal;
    extractedFieldsCount : Integer;
    validatedFieldsCount : Integer;
    status               : String;
    processingStatus     : String;
  };
}
