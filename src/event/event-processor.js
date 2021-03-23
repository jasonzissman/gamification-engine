
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

function computeProgressUpdatesToMake(event, criteria) {
    const progressUpdates = [];

    if (criteria && criteria.length > 0) {
        for (const criterion of criteria) {

            const entityIdField = criterion.targetEntityId;
            const entityId = event[entityIdField];
            if (entityId && entityId.length > 0) {
                progressUpdates.push({
                    entityId: entityId,
                    goalId: criterion.goalId,
                    criterionId: criterion.id,
                    aggregation: criterion.aggregation,
                    aggregationValue: criterion.aggregationValue,
                    threshold: criterion.threshold
                });

            }
        }
    }

    return progressUpdates;
}

async function getReleventGoalsAndEntityProgressFromDb(progressUpdates) {
    const allImpactedEntityIds = progressUpdates.map(p => p.entityId);
    const relevantEntityProgressPromise = dbHelper.getSpecificEntityProgress(allImpactedEntityIds);
    const allRelevantGoalIds = progressUpdates.map(p => p.goalId);
    const relevantGoalsPromise = dbHelper.getSpecificGoals(allRelevantGoalIds);

    return Promise.all([relevantEntityProgressPromise, relevantGoalsPromise]);
}

function arrayToObjectWithIdKey(array) {
    return array.reduce((result, item) => {
        result[item.id] = item;
        return result;
    }, {});
}

async function initEntityProgressTowardsCriterion(relevantEntityProgress, entityId, goalID, criterionId) {
    if (!relevantEntityProgress[entityId]) {
        relevantEntityProgress[entityId] = {
            id: entityId,
            goals: {}
        };
    }
    if (!relevantEntityProgress[entityId].goals[goalID]) {
        relevantEntityProgress[entityId].goals[goalID] = {
            isComplete: false,
            criteria: {}
        };
    }
    if (!relevantEntityProgress[entityId].goals[goalID].criteria[criterionId]) {
        relevantEntityProgress[entityId].goals[goalID].criteria[criterionId] = {
            isComplete: false,
            value: 0
        };
    }
}

async function updateProgressTowardsGoals(event, criteria) {

    const progressUpdatesToMake = computeProgressUpdatesToMake(event, criteria);
    if (progressUpdatesToMake && progressUpdatesToMake.length > 0) {

        const dbInvocations = await getReleventGoalsAndEntityProgressFromDb(progressUpdatesToMake);
        const relevantEntityProgress = arrayToObjectWithIdKey(dbInvocations[0]);
        const relevantGoals = arrayToObjectWithIdKey(dbInvocations[1]);

        for (progressUpdate of progressUpdatesToMake) {

            const entityId = progressUpdate.entityId;
            const goalID = progressUpdate.goalId;
            const criterionId = progressUpdate.criterionId;
            const aggregation = progressUpdate.aggregation;
            const aggregationValue = progressUpdate.aggregationValue;

            initEntityProgressTowardsCriterion(relevantEntityProgress, entityId, goalID, criterionId);

            let hasCriterionBeenCompleted = relevantEntityProgress[entityId].goals[goalID].criteria[criterionId].isComplete;

            // TODO ONLY SUPPORTS COUNT AGGREGATION FOR NOW
            if (aggregation === "count") {
                relevantEntityProgress[entityId].goals[goalID].criteria[criterionId].value += aggregationValue;
                if (!hasCriterionBeenCompleted && relevantEntityProgress[entityId].goals[goalID].criteria[criterionId].value >= progressUpdate.threshold) {
                    hasCriterionBeenCompleted = true;
                    relevantEntityProgress[entityId].goals[goalID].criteria[criterionId].isComplete = true;
                }
            }

            // check if all goal requirements met, update if so
            if (!relevantEntityProgress[entityId].goals[goalID].isComplete) {
                let markGoalAsComplete = true;
                for (const thisCriterionId of relevantGoals[goalID].criteria) {
                    markGoalAsComplete = markGoalAsComplete && (relevantEntityProgress[entityId].goals[goalID].criteria[thisCriterionId] && relevantEntityProgress[entityId].goals[goalID].criteria[thisCriterionId].isComplete);
                    if (!markGoalAsComplete) {
                        break;
                    }
                }
                if (markGoalAsComplete) {
                    relevantEntityProgress[entityId].goals[goalID].isComplete = true;
                }
            }

        }

        // reinsert relevantEntityProgress into DB
        await dbHelper.updateSpecificEntityProgress(relevantEntityProgress);

    }

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

module.exports = {
    processEvent,
    computeProgressUpdatesToMake,
    createCleanVersionOfEvent
};