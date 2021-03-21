
const eventCriteriaMatcher = require('./event-criteria-matcher');
const eventFieldsHelper = require('./event-fields-helper');

function processEvent(receivedEvent) {
    // TODO authorize request - put in middleware?

    if (receivedEvent) {
        // TODO cleanse data to only be acceptable alphabet AND reduce to only field-value combos known to be in criteria
        let cleanEvent = createCleanVersionOfEvent(receivedEvent, eventCriteriaMatcher.KNOWN_CRITERIA_KEY_VALUE_PAIRS);
        // TODO find relevant criteria IDs from lookup map

        // TODO if relevant criteria IDs found, update progress for this entityID towards those goals
    }
}

function createCleanVersionOfEvent(receivedEvent, knownCriteriaKeyValuePairs) {
    let cleanEvent = {};

    for(let key in receivedEvent) {
        let cleanKey = eventFieldsHelper.generateCleanField(key);
        let cleanValue = eventFieldsHelper.generateCleanField(receivedEvent[key]);

        let keyValueCombo = eventFieldsHelper.generateNormalizedFieldValueKey(cleanKey, cleanValue);
        if(knownCriteriaKeyValuePairs[keyValueCombo]) {
            cleanEvent[cleanKey] = cleanValue
        }
    }

    return cleanEvent;
}

module.exports = { processEvent, createCleanVersionOfEvent };