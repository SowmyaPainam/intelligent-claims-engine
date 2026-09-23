sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"com/company/claimsdashboard/test/integration/pages/ClaimsList.gen",
	"com/company/claimsdashboard/test/integration/pages/ClaimsObjectPage.gen"
], function (JourneyRunner, ClaimsListGenerated, ClaimsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('com/company/claimsdashboard') + '/test/flp.html#app-preview',
        pages: {
			onTheClaimsListGenerated: ClaimsListGenerated,
			onTheClaimsObjectPageGenerated: ClaimsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

