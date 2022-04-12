import { generateCleanField, generateNormalizedFieldValueKey } from './event-fields-helper.js';
import { KNOWN_CRITERIA_KEY_VALUE_PAIRS, KNOWN_SYSTEM_FIELDS, getCriteriaFulfilledByEvent, updateEntityProgress } from '../database/db-helper.js';
import { log } from '../utility/logger.js';

async function processEvent(receivedEvent) {

    if (receivedEvent) {

        log(`Processing event.`);

        const cleanEvent = createCleanVersionOfEvent(receivedEvent, KNOWN_CRITERIA_KEY_VALUE_PAIRS, KNOWN_SYSTEM_FIELDS);
        if (cleanEvent && Object.keys(cleanEvent).length > 0) {
            const criteria = await getCriteriaFulfilledByEvent(cleanEvent);

            for (let criterion of criteria) {

                const incrementValue = computeIncrementValue(criterion, cleanEvent);
                const entityIdValue = cleanEvent[criterion.targetEntityIdField];

                const hasCompleted = await updateEntityProgress(criterion.targetEntityIdField, entityIdValue, criterion, incrementValue);
                if (hasCompleted && hasCompleted[0] === true) {
                    // TODO - here we can broadcast that an entity has finished all the criteria within a goal
                }
            }

        }
    }
}

function computeIncrementValue(criterion, event) {

    // TODO lots of nested if conditions, can we clean this up?

    let incrementValue = 1;

    if (criterion.aggregation.type === "sum") {
        if (criterion.aggregation.value !== '' && criterion.aggregation.value !== null && !isNaN(criterion.aggregation.value)) {
            incrementValue = Number(criterion.aggregation.value);
        } else if (criterion.aggregation.valueField !== '' && criterion.aggregation.valueField !== null && !isNaN(event[criterion.aggregation.valueField]) && event[criterion.aggregation.valueField] !== null) {
            incrementValue = Number(event[criterion.aggregation.valueField])
        }
    }

    return incrementValue;
}

function createCleanVersionOfEvent(receivedEvent, knownCriteriaKeyValuePairs, knownSystemFields) {
    let cleanEvent = {};

    for (let key in receivedEvent) {
        let cleanKey = generateCleanField(key);
        let cleanValue = generateCleanField(receivedEvent[key]);

        let keyValueCombo = generateNormalizedFieldValueKey(cleanKey, cleanValue);
        if (knownCriteriaKeyValuePairs[keyValueCombo] || knownSystemFields[cleanKey]) {
            cleanEvent[cleanKey] = cleanValue
        }
    }

    return cleanEvent;
}

export {
    processEvent,
    createCleanVersionOfEvent,
    computeIncrementValue
};