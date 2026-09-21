class Validators {
  static validateClaim(claim) {
    const errors = [];

    if (!claim.customerName || claim.customerName.trim() === '') {
      errors.push('Customer name is required');
    }

    if (!claim.customerEmail || !this.validateEmail(claim.customerEmail)) {
      errors.push('Valid customer email is required');
    }

    if (!claim.claimAmount || claim.claimAmount <= 0) {
      errors.push('Claim amount must be greater than 0');
    }

    if (claim.claimAmount > 1000000) {
      errors.push('Claim amount exceeds maximum limit');
    }

    if (!claim.productId || claim.productId.trim() === '') {
      errors.push('Product ID is required');
    }

    if (!claim.issueDescription || claim.issueDescription.trim() === '') {
      errors.push('Issue description is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateExtractedData(extractedData) {
    const result = {
      valid: [],
      invalid: [],
      requiresReview: []
    };

    extractedData.forEach((field) => {
      if (field.confidence >= 0.9) {
        result.valid.push(field);
      } else if (field.confidence >= 0.7) {
        result.requiresReview.push(field);
      } else {
        result.invalid.push(field);
      }
    });

    return result;
  }

  static validateBudget(budget) {
    const errors = [];

    if (!budget.department) {
      errors.push('Department is required');
    }

    if (budget.totalBudget <= 0) {
      errors.push('Total budget must be greater than 0');
    }

    if (budget.usedBudget < 0) {
      errors.push('Used budget cannot be negative');
    }

    if (budget.usedBudget > budget.totalBudget) {
      errors.push('Used budget cannot exceed total budget');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validators;