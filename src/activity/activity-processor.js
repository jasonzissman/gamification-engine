import { generateCleanField, generateNormalizedFieldValueKey } from './activity-fields-helper.js';
import { KNOWN_CRITERIA_KEY_VALUE_PAIRS, KNOWN_SYSTEM_FIELDS, getCriteriaFulfilledByActivity, updateEntityProgress, KNOWN_CRITERIA_NUMERIC_FIELDS } from '../database/db-helper.js';

async function processActivity(receivedActivity) {

    if (receivedActivity) {

        const cleanActivity = createCleanVersionOfActivity(receivedActivity, KNOWN_CRITERIA_KEY_VALUE_PAIRS, { ...KNOWN_SYSTEM_FIELDS, ...KNOWN_CRITERIA_NUMERIC_FIELDS });
        if (cleanActivity && Object.keys(cleanActivity).length > 0) {
            const criteria = await getCriteriaFulfilledByActivity(cleanActivity);

            for (let criterion of criteria) {

                const incrementValue = computeIncrementValue(criterion, cleanActivity);
                const entityIdValue = cleanActivity[criterion.targetEntityIdField];

                const hasCompleted = await updateEntityProgress(entityIdValue, criterion, incrementValue);
                if (hasCompleted && hasCompleted[0] === true) {
                    // TODO - here we can broadcast that an entity has finished all the criteria within a goal
                }
            }

        }
    }
}

function computeIncrementValue(criterion, activity) {

    // TODO lots of nested if conditions, can we clean this up?

    let incrementValue = 1;

    if (criterion.aggregation.type === "sum") {
        if (criterion.aggregation.value !== '' && criterion.aggregation.value !== null && !isNaN(criterion.aggregation.value)) {
            incrementValue = Number(criterion.aggregation.value);
        } else if (criterion.aggregation.valueField !== '' && criterion.aggregation.valueField !== null && !isNaN(activity[criterion.aggregation.valueField]) && activity[criterion.aggregation.valueField] !== null) {
            incrementValue = Number(activity[criterion.aggregation.valueField])
        }
    }

    return incrementValue;
}

function createCleanVersionOfActivity(receivedActivity, knownCriteriaKeyValuePairs, knownSystemFields) {
    let cleanActivity = {};

    for (let key in receivedActivity) {
        let cleanKey = generateCleanField(key);
        let cleanValue = generateCleanField(receivedActivity[key]);

        let keyValueCombo = generateNormalizedFieldValueKey(cleanKey, cleanValue);
        if (knownCriteriaKeyValuePairs[keyValueCombo] || knownSystemFields[cleanKey]) {
            cleanActivity[cleanKey] = cleanValue
        }
    }

    return cleanActivity;
}

export {
    processActivity,
    createCleanVersionOfActivity,
    computeIncrementValue
};