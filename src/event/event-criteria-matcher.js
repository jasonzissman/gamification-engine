const eventFieldsHelper = require('../event/event-fields-helper');
const logger = require('../utility/logger');

// TODO should be better data structure than plain object for fast lookups
let EVENT_LOOKUP_MAP = {};
let KNOWN_CRITERIA_KEY_VALUE_PAIRS = {};
let KNOWN_SYSTEM_FIELDS = {};
let CRITERIA_IDS_FIELD = "_criteriaIds";

function clearOutObject(object) {
    for (var key in object) {
        delete object[key];
    }
}

function initCriteriaLookupMap(criteria) {
    logger.info("Initializing lookup maps.");
    clearOutObject(EVENT_LOOKUP_MAP);
    clearOutObject(KNOWN_CRITERIA_KEY_VALUE_PAIRS);
    clearOutObject(KNOWN_SYSTEM_FIELDS);
    addNewCriteriaToLookupMap(criteria);
    logger.info(`All known criteria size: ${Object.keys(KNOWN_CRITERIA_KEY_VALUE_PAIRS).length}`);
    logger.info(`All known entityId fields size: ${Object.keys(KNOWN_SYSTEM_FIELDS).length}`);
    logger.info(`Lookup map size (top level only): ${Object.keys(EVENT_LOOKUP_MAP).length}`);
    logger.info(`Finished initializing lookup maps.`);
    return;
}

function addNewCriteriaToLookupMap(criteria) {
    for (criterion of criteria) {
        addNewCriterionToLookupMap(criterion)
    }
    return
}

function addNewCriterionToLookupMap(criterion) {

    KNOWN_SYSTEM_FIELDS[criterion.targetEntityIdField] = true;
    if (criterion.aggregation.type === "sum" && !criterion.aggregation.value) {
        KNOWN_SYSTEM_FIELDS[criterion.aggregation.valueField] = true;
    }
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

module.exports = { KNOWN_CRITERIA_KEY_VALUE_PAIRS, KNOWN_SYSTEM_FIELDS, initCriteriaLookupMap, addNewCriteriaToLookupMap, addNewCriterionToLookupMap, lookupMatchingCriteria };