using ClaimsService as service from '../../srv/claims-service';
annotate service.Claims with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'documentName',
                Value : documentName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'customerName',
                Value : customerName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'customerEmail',
                Value : customerEmail,
            },
            {
                $Type : 'UI.DataField',
                Label : 'productId',
                Value : productId,
            },
            {
                $Type : 'UI.DataField',
                Label : 'productName',
                Value : productName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'issueDescription',
                Value : issueDescription,
            },
            {
                $Type : 'UI.DataField',
                Label : 'claimAmount',
                Value : claimAmount,
            },
            {
                $Type : 'UI.DataField',
                Label : 'currency',
                Value : currency,
            },
            {
                $Type : 'UI.DataField',
                Label : 'extractionConfidence',
                Value : extractionConfidence,
            },
            {
                $Type : 'UI.DataField',
                Label : 'status',
                Value : status,
            },
            {
                $Type : 'UI.DataField',
                Label : 'decisionReason',
                Value : decisionReason,
            },
            {
                $Type : 'UI.DataField',
                Label : 'decisionTime',
                Value : decisionTime,
            },
            {
                $Type : 'UI.DataField',
                Label : 'processedBy',
                Value : processedBy,
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
            Label : 'documentName',
            Value : documentName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'customerName',
            Value : customerName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'customerEmail',
            Value : customerEmail,
        },
        {
            $Type : 'UI.DataField',
            Label : 'productId',
            Value : productId,
        },
        {
            $Type : 'UI.DataField',
            Label : 'productName',
            Value : productName,
        },
    ],
);

