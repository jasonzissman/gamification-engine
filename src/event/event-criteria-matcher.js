let EVENT_LOOKUP_MAP = {};

function generateLookupFieldValueKey(criterionKey, criterionValue) {
    return `${criterionKey}=${criterionValue}`;
}

function initCriteriaLookupMap(criteria) {

    EVENT_LOOKUP_MAP = {};

    for (criterion of criteria) {
        addNewCriterionQualifyingEvent(criterion)
    }

    return;
}

function addNewCriterionQualifyingEvent(criterion) {
    const criterionQualifyingEvent = Object.assign({}, criterion.qualifyingEvent);
    const sortedKeys = Object.keys(criterionQualifyingEvent).sort();

    let pointerToLastNode = EVENT_LOOKUP_MAP;
    for (const criterionKey of sortedKeys) {
        const formattedLookupKey = generateLookupFieldValueKey(criterionKey, criterionQualifyingEvent[criterionKey]);
        if (!pointerToLastNode[formattedLookupKey]) {
            pointerToLastNode[formattedLookupKey] = {};
        }
        pointerToLastNode = pointerToLastNode[formattedLookupKey];
    }

    if (!pointerToLastNode) {
        pointerToLastNode = {
            _criteriaIds: []
        }
    } else if (pointerToLastNode["_criteriaIds"] === undefined) {
        pointerToLastNode["_criteriaIds"] = [];
    }
    pointerToLastNode["_criteriaIds"].push(criterion.id);


    return;
}

function lookupMatchingCriteria(receivedEvent) {
    const matchingCriteriaIds = [];
    const receivedEventClone = Object.assign({}, receivedEvent);
    const sortedKeys = Object.keys(receivedEventClone).sort();

    const nodesToSearch = [EVENT_LOOKUP_MAP];
    for(const criterionKey of sortedKeys) {
        const formattedLookupKey = generateLookupFieldValueKey(criterionKey, receivedEventClone[criterionKey]);
        for(const node of nodesToSearch) {
            if(node[formattedLookupKey]) {
                nodesToSearch.push(node[formattedLookupKey]);
                if (node[formattedLookupKey]["_criteriaIds"]) {
                    Array.prototype.push.apply(matchingCriteriaIds, node[formattedLookupKey]["_criteriaIds"]);                    
                }
            }
        }
    }



    return matchingCriteriaIds;
}


module.exports = { initCriteriaLookupMap, addNewCriterionQualifyingEvent, lookupMatchingCriteria };