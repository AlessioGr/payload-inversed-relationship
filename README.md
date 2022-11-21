# NOTE: Please switch to [this project](https://github.com/TimHal/pcms-backpop).

# payload-inversed-relationship
Inversed / Bi-directional relationship field for payload cms

## Current main issues:

- Relationship only updates if the parent is changed - not if the child is changed. That's why currently the child's field is read-only.
- Deleting the parent or removing the relationships from the parent completely does not update the relationship of the child. Only adding relationships seem to work fine - not removing or deleting them. I have tried to fix that by FIRST removing all relationships FROM the child TO the parent in the handleParentBeforeChange OF the PARENT first, before adding them again in the handleParentAfterChange hook. My thinking was that the handleParentBeforeChange runs BEFORE the relatinships were removed from the parent. That's not the case though. Thus, this approach won't work as I sadly do not know which relationships were removed in the handleParentBeforeChange hook.

## Other issues:

- I don't think it works that well if there's multiple parents having a relationship one child? (Might be wrong there)
- I still have to add the field to both parent & child, even though adding it to only one should optimally be enough
