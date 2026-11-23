using ApprovalService as service from '../../srv/approval-service';
annotate service.Approvals with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'claimID',
                Value : claimID,
            },
            {
                $Type : 'UI.DataField',
                Label : 'customerName',
                Value : claim.customerName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'claimAmount',
                Value : claim.claimAmount,
            },
            {
                $Type : 'UI.DataField',
                Label : 'currency',
                Value : claim.currency,
            },
            {
                $Type : 'UI.DataField',
                Label : 'productId',
                Value : claim.productId,
            },
            {
                $Type : 'UI.DataField',
                Label : 'issueDescription',
                Value : claim.issueDescription,
            },
            {
                $Type : 'UI.DataField',
                Label : 'level',
                Value : level,
            },
            {
                $Type : 'UI.DataField',
                Label : 'levelName',
                Value : levelName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'assignedTo',
                Value : assignedTo,
            },
            {
                $Type : 'UI.DataField',
                Label : 'decision',
                Value : decision,
            },
            {
                $Type : 'UI.DataField',
                Label : 'comments',
                Value : comments,
            },
            {
                $Type : 'UI.DataField',
                Label : 'decisionAt',
                Value : decisionAt,
            },
            {
                $Type : 'UI.DataField',
                Label : 'decisionBy',
                Value : decisionBy,
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
            Label : 'customerName',
            Value : claim.customerName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'claimAmount',
            Value : claim.claimAmount,
        },
        {
            $Type : 'UI.DataField',
            Label : 'level',
            Value : level,
        },
        {
            $Type : 'UI.DataField',
            Label : 'levelName',
            Value : levelName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'decision',
            Value : decision,
        },
    ],
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ApprovalService.EntityContainer/SubmitApprovalDecision',
            Label : 'Submit Decision',
        },
    ],
);