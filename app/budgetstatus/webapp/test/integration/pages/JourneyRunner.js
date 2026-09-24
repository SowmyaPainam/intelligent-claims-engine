sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"budgetstatus/test/integration/pages/BudgetsList.gen",
	"budgetstatus/test/integration/pages/BudgetsObjectPage.gen"
], function (JourneyRunner, BudgetsListGenerated, BudgetsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('budgetstatus') + '/test/flp.html#app-preview',
        pages: {
			onTheBudgetsListGenerated: BudgetsListGenerated,
			onTheBudgetsObjectPageGenerated: BudgetsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

