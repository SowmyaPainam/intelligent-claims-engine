sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"auditviewer/test/integration/pages/AuditLogList.gen",
	"auditviewer/test/integration/pages/AuditLogObjectPage.gen"
], function (JourneyRunner, AuditLogListGenerated, AuditLogObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('auditviewer') + '/test/flp.html#app-preview',
        pages: {
			onTheAuditLogListGenerated: AuditLogListGenerated,
			onTheAuditLogObjectPageGenerated: AuditLogObjectPageGenerated
        },
        async: true
    });

    return runner;
});

