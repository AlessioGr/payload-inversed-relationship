import { Field } from 'payload/types';
import { handleParentBeforeChange, handleParentAfterChange } from "./InversedRelationshipFieldHooks";

export function InversedRelationshipField(args: {
    childOf?: string[],
    children?: string[],
    hasMany?: boolean,
    childFieldName?: string,
    parentFieldName?: string,
    collectionName?: string,
}): Field[]  {

    let fields: Field[] = [];

    //Add to the parent field => Child has changed
    if (!!args.childOf?.length) {
        fields.push({
            name: args.childFieldName,
            type: 'relationship',
            hasMany: args.hasMany,
            relationTo: args.childOf,
            admin: {
                readOnly: true, //TODO: Allow editing of parent field with own hooks in the future
            },
            hooks: {
                /*afterChange: [
                    handleParentChange(args.childFieldName ? args.childFieldName : "parent"), //TODO: Add (see readOnly: true comment above)
                ],*/
            },
        });
    }

    //Add to the child field => parent has changed
    if (!!args.children?.length) {
        fields.push({
            name: args.parentFieldName,
            type: 'relationship',
            hasMany: args.hasMany,
            relationTo: args.children,
            hooks: {
                beforeChange: [
                    handleParentBeforeChange(args.collectionName, args.parentFieldName, args.childFieldName),
                ],
                afterChange: [
                    handleParentAfterChange(args.collectionName, args.parentFieldName, args.childFieldName),
                ],
            },
        });
    }
    return fields;
}
