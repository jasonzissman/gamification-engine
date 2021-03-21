const eventFieldsHelper = require('../event/event-fields-helper');

let KNOWN_CRITERIA_KEY_VALUE_PAIRS = {};
let EVENT_LOOKUP_MAP = {};
let CRITERIA_IDS_FIELD = "_criteriaIds";

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
        const formattedLookupKey = eventFieldsHelper.generateNormalizedFieldValueKey(criterionKey, criterion.qualifyingEvent[criterionKey]);
        KNOWN_CRITERIA_KEY_VALUE_PAIRS[formattedLookupKey] = true;
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
    for (const criterionKey of sortedKeys) {
        const formattedLookupKey = eventFieldsHelper.generateNormalizedFieldValueKey(criterionKey, receivedEvent[criterionKey]);
        for (const node of nodesToSearch) {
            if (node[formattedLookupKey]) {
                nodesToSearch.push(node[formattedLookupKey]);
                if (node[formattedLookupKey][CRITERIA_IDS_FIELD]) {
                    Array.prototype.push.apply(matchingCriteriaIds, node[formattedLookupKey][CRITERIA_IDS_FIELD]);
                }
            }
        }
    }

    return matchingCriteriaIds;
}

module.exports = { KNOWN_CRITERIA_KEY_VALUE_PAIRS, initCriteriaLookupMap, addNewCriteriaToLookupMap, addNewCriterionToLookupMap, lookupMatchingCriteria };