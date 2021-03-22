
const eventCriteriaMatcher = require('./event-criteria-matcher');
const eventFieldsHelper = require('./event-fields-helper');
const dbHelper = require('../database/db-helper');

async function processEvent(receivedEvent) {
    // TODO authorize request - put in middleware?
    // TODO - is there a better design pattern to filter out irrelevant events? 
    // We have ~10 nested if checks here.

    if (receivedEvent) {
        const cleanEvent = createCleanVersionOfEvent(receivedEvent, eventCriteriaMatcher.KNOWN_CRITERIA_KEY_VALUE_PAIRS, eventCriteriaMatcher.KNOWN_ENTITY_ID_FIELDS);

        if (cleanEvent && Object.keys(cleanEvent).length > 0) {

            const relevantCriteriaIds = eventCriteriaMatcher.lookupMatchingCriteria(cleanEvent);

            if (relevantCriteriaIds && relevantCriteriaIds.length > 0) {

                // TODO cache this, they won't change often
                const criteria = await dbHelper.getSpecificCriteria(relevantCriteriaIds);

                if (criteria && criteria.length > 0) {

                    updateProgressTowardsGoals(cleanEvent, criteria);

                }

            }
        }

    }
}

function getListOfUpdatesToMake(event, criteria) {
    const progressUpdates = [];

    for (const criterion of criteria) {

        const entityIdField = criterion.targetEntityId;
        const entityId = event[entityIdField];
        if (entityId && entityId.length > 0) {
            // TODO ONLY SUPPORTS COUNT AGGREGATIONS FOR NOW
            if (criterion.aggregation === "count") {
                progressUpdates.push({
                    entityId: entityId,
                    goalId: criterion.goalId,
                    criterionId: criterion.id,
                    aggregation: "count",
                    change: 1
                });
            }
        }
    }
    
    return progressUpdates;
}

async function updateProgressTowardsGoals(event, criteria) {

    const progressUpdates = getListOfUpdatesToMake(event, criteria);
    const allImpactedEntities = progressUpdates.map(p => p.entityId);
    const relevantEntityProgressPromise = dbHelper.getSpecificEntityProgress(allImpactedEntities);
    const relevantGoalsPromise = dbHelper.getSpecificGoals(progressUpdates.map(p => p.goalId));

    const dbInvocations = await Promise.all([relevantEntityProgressPromise, relevantGoalsPromise]);
    
    const relevantEntityProgress = dbInvocations[0];
    const relevantGoals = dbInvocations[1];

    for(entity of allImpactedEntities) {
        // if no existing entity progress in DB, create new one
        // If no progress on this goal for this entity, create new one
        // If no progress on this criteria for this entity, create new one
        // update progress towards criteria
        // check if all criteria requirements met, update if so
        // check if all goal requirements met, update if so
        // reinsert into DB
    }

    // Send notification if goal completed
}

function createCleanVersionOfEvent(receivedEvent, knownCriteriaKeyValuePairs, knownEntityIds) {
    let cleanEvent = {};

    for (let key in receivedEvent) {
        let cleanKey = eventFieldsHelper.generateCleanField(key);
        let cleanValue = eventFieldsHelper.generateCleanField(receivedEvent[key]);

        let keyValueCombo = eventFieldsHelper.generateNormalizedFieldValueKey(cleanKey, cleanValue);
        if (knownCriteriaKeyValuePairs[keyValueCombo] || knownEntityIds[cleanKey]) {
            cleanEvent[cleanKey] = cleanValue
        }
    }

    return cleanEvent;
}

module.exports = { processEvent, createCleanVersionOfEvent };