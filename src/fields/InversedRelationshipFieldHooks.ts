import payload from "payload";

import { FieldHook } from 'payload/types';




//Remove all relations to parent from the child
export function handleParentBeforeChange(parentCollectionName: string, parentFieldName: string, childFieldName: string): FieldHook {
    async function hook({data, findMany, operation, originalDoc, req, siblingData, value}) {
        console.log("handleParentBeforeChange")


        console.log("data", data);
        console.log("findMany", findMany);
        console.log("operation", operation);
        console.log("value", value);

        if(!data[parentFieldName]) {
            console.log("data.parentFieldName " + parentFieldName + " not found");
            return;
        }

        for(const relation of data[parentFieldName]){
            const relationCollection = getRelation(relation);
            const childData = await relationCollection.document;
            console.log("relCollection doc", childData);

            if(!childData[childFieldName]) {
                console.log("childData.childFieldName " + childFieldName + " not found");
                return;
            }

            console.log("Updating childData.childFieldName " + childFieldName);
            console.log("relationCollection.type", relationCollection.type);
            console.log("relationCollection.id", relationCollection.id);
            console.log("value", value);
            console.log("originalDoc", originalDoc);


            //remove existing relations

            const ii = payload.update({
                collection: relationCollection.type,
                id: relationCollection.id,
                data: {
                    [childFieldName]: [
                    ],
                },
            });

            console.log("ii", ii);
        }
    }

    return hook;
}

// Parent has changed inversed relation value => Update the respective hierarchical field of the child, if it exists. First find the child, then go through ALL possible parents and make the chields field correct
export function handleParentAfterChange(parentCollectionName: string, parentFieldName: string, childFieldName: string): FieldHook {
    async function hook({data, findMany, operation, originalDoc, req, siblingData, value}) {
        console.log("handleParentAfterChange")


        console.log("data", data);
        console.log("operation", operation);
        console.log("value", value);

        if(!data[parentFieldName]) {
            console.log("data.parentFieldName " + parentFieldName + " not found");
            return;
        }

        for(const relation of data[parentFieldName]){
            const relationCollection = getRelation(relation);
            const childData = await relationCollection.document;
            console.log("relCollection doc", childData);

            if(!childData[childFieldName]) {
                console.log("childData.childFieldName " + childFieldName + " not found");
                return;
            }

            console.log("Updating childData.childFieldName " + childFieldName);
            console.log("relationCollection.type", relationCollection.type);
            console.log("relationCollection.id", relationCollection.id);
            console.log("value", value);
            console.log("originalDoc", originalDoc);


            //Get all relations then add them to child
            const relationFieldValueOfChild: {relationTo: string, value: string}[] = [];

            relationFieldValueOfChild.push(
                {relationTo: parentCollectionName, value: originalDoc.id}
            )

            //Now fill from other possible parents
            const otherParents = await payload.find({
                collection: parentCollectionName, // required
                depth: 2,
                page: 1,
                limit: 10000,
                where: {},
            })
            console.log("otherParents", otherParents);

            for(const otherParent of otherParents.docs){
                if(otherParent.id === originalDoc.id || !otherParents[parentFieldName]) {
                    continue;
                }
                for(const otherParentChild of otherParent[parentFieldName]){
                    if(otherParentChild.relationTo === relationCollection.type && otherParentChild.value === relationCollection.id){
                        relationFieldValueOfChild.push(
                            {relationTo: parentCollectionName, value: otherParent.id}
                        )
                    }
                }
            }

            const updateResult = await payload.update({
                collection: relationCollection.type,
                id: relationCollection.id,
                data: {
                    [childFieldName]: relationFieldValueOfChild,
                },
            });

            console.log("update result", updateResult);
        }
    }

    return hook;
}

function getRelation(obj: any): { type: string, id: string, document: Promise<any> } {
    let type: string = obj["relationTo"];
    let id: string = obj["value"];

    return {
        type: type,
        id: id,
        document: payload.findByID({
            collection: type,
            id: id,
            depth: 1
        }) as Promise<any>
    }
}


