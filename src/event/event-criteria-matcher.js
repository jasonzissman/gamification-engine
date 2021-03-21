let EVENT_LOOKUP_MAP = {};
let CRITERIA_IDS_FIELD = "_criteriaIds";

function generateLookupFieldValueKey(criterionKey, criterionValue) {
    return `${criterionKey}=${criterionValue}`;
}

function initCriteriaLookupMap(criteria) {
    EVENT_LOOKUP_MAP = {};
    addNewCriteriaToLookupMap(criteria);
    return;
}

function addNewCriteriaToLookupMap(criteria) {
    for (criterion of criteria) {
        addNewCriterionToLookupMap(criterion)
    }
    return
}

function addNewCriterionToLookupMap(criterion) {

    const sortedKeys = Object.keys(criterion.qualifyingEvent).sort();

    let pointerToLastNode = EVENT_LOOKUP_MAP;
    for (const criterionKey of sortedKeys) {
        const formattedLookupKey = generateLookupFieldValueKey(criterionKey, criterion.qualifyingEvent[criterionKey]);
        if (!pointerToLastNode[formattedLookupKey]) {
            pointerToLastNode[formattedLookupKey] = {};
        }
        pointerToLastNode = pointerToLastNode[formattedLookupKey];
    }

    if (!pointerToLastNode) {
        pointerToLastNode = {
            _criteriaIds: []
        }
    } else if (pointerToLastNode[CRITERIA_IDS_FIELD] === undefined) {
        pointerToLastNode[CRITERIA_IDS_FIELD] = [];
    }
    pointerToLastNode[CRITERIA_IDS_FIELD].push(criterion.id);


    return;
}

function lookupMatchingCriteria(receivedEvent) {
    const matchingCriteriaIds = [];    
    const sortedKeys = Object.keys(receivedEvent).sort();

    const nodesToSearch = [EVENT_LOOKUP_MAP];
    for(const criterionKey of sortedKeys) {
        const formattedLookupKey = generateLookupFieldValueKey(criterionKey, receivedEvent[criterionKey]);
        for(const node of nodesToSearch) {
            if(node[formattedLookupKey]) {
                nodesToSearch.push(node[formattedLookupKey]);
                if (node[formattedLookupKey][CRITERIA_IDS_FIELD]) {
                    Array.prototype.push.apply(matchingCriteriaIds, node[formattedLookupKey][CRITERIA_IDS_FIELD]);                    
                }
            }
        }
    }

    return matchingCriteriaIds;
}

module.exports = { initCriteriaLookupMap, addNewCriteriaToLookupMap, addNewCriterionToLookupMap, lookupMatchingCriteria };