using AuditService as service from '../../srv/audit-service';
annotate service.AuditLog with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'action',
                Value : action,
            },
            {
                $Type : 'UI.DataField',
                Label : 'actor',
                Value : actor,
            },
            {
                $Type : 'UI.DataField',
                Label : 'details',
                Value : details,
            },
            {
                $Type : 'UI.DataField',
                Label : 'timestamp',
                Value : timestamp,
            },
            {
                $Type : 'UI.DataField',
                Label : 'status',
                Value : status,
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
            Label : 'action',
            Value : action,
        },
        {
            $Type : 'UI.DataField',
            Label : 'actor',
            Value : actor,
        },
        {
            $Type : 'UI.DataField',
            Label : 'details',
            Value : details,
        },
        {
            $Type : 'UI.DataField',
            Label : 'timestamp',
            Value : timestamp,
        },
        {
            $Type : 'UI.DataField',
            Label : 'status',
            Value : status,
        },
    ],
);

