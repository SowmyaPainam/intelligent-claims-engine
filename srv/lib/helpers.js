const { v4: uuid } = require('uuid');

class Helpers {
  static generateId() {
    return uuid();
  }

  static formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static logAction(action, details = {}) {
    console.log(`[${new Date().toISOString()}] ${action}`, details);
  }

  static calculatePercentage(part, whole) {
    if (whole === 0) return 0;
    return (part / whole * 100).toFixed(2);
  }

  static createAuditEntry(claimId, action, actor, details = {}) {
    return {
      claim_id: claimId,
      action,
      actor,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString()
    };
  }

  static createDecisionLog(claimId, decision, reason, processingTime) {
    return {
      claim_id: claimId,
      decision,
      reason,
      processing_time: processingTime,
      decision_time: new Date().toISOString()
    };
  }

  static isApprovalNeeded(claimAmount, budgetRemaining, safeLimit = 15000, warningThreshold = 20) {
    const budgetPercentage = budgetRemaining.percentage || 0;
    return claimAmount > safeLimit || budgetPercentage < warningThreshold;
  }

  static getApprovalLevel(riskLevel) {
    const levels = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 2,
      'CRITICAL': 3
    };
    return levels[riskLevel] || 1;
  }
}

module.exports = Helpers;
