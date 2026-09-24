sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"approvalqueue/test/integration/pages/ApprovalsList.gen",
	"approvalqueue/test/integration/pages/ApprovalsObjectPage.gen"
], function (JourneyRunner, ApprovalsListGenerated, ApprovalsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('approvalqueue') + '/test/flp.html#app-preview',
        pages: {
			onTheApprovalsListGenerated: ApprovalsListGenerated,
			onTheApprovalsObjectPageGenerated: ApprovalsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

