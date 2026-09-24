using BudgetService as service from '../../srv/budget-service';
annotate service.Budgets with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'department',
                Value : department,
            },
            {
                $Type : 'UI.DataField',
                Label : 'totalBudget',
                Value : totalBudget,
            },
            {
                $Type : 'UI.DataField',
                Label : 'allocatedBudget',
                Value : allocatedBudget,
            },
            {
                $Type : 'UI.DataField',
                Label : 'usedBudget',
                Value : usedBudget,
            },
            {
                $Type : 'UI.DataField',
                Label : 'remainingBudget',
                Value : remainingBudget,
            },
            {
                $Type : 'UI.DataField',
                Label : 'warningThreshold',
                Value : warningThreshold,
            },
            {
                $Type : 'UI.DataField',
                Label : 'fiscalYear',
                Value : fiscalYear,
            },
            {
                $Type : 'UI.DataField',
                Label : 'currency',
                Value : currency,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'department',
            Value : department,
        },
        {
            $Type : 'UI.DataField',
            Label : 'totalBudget',
            Value : totalBudget,
        },
        {
            $Type : 'UI.DataField',
            Label : 'allocatedBudget',
            Value : allocatedBudget,
        },
        {
            $Type : 'UI.DataField',
            Label : 'usedBudget',
            Value : usedBudget,
        },
        {
            $Type : 'UI.DataField',
            Label : 'remainingBudget',
            Value : remainingBudget,
        },
    ],
);

