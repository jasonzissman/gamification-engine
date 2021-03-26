
const eventCriteriaMatcher = require('./event-criteria-matcher');
const eventFieldsHelper = require('./event-fields-helper');
const dbHelper = require('../database/db-helper');
const entityHelper = require('../entity/entity-helper');

const logger = require('../utility/logger');

async function processEvent(receivedEvent) {
    // TODO authorize request - put in middleware?
    // TODO - is there a better design pattern to filter out irrelevant events? 
    // We have ~10 nested if checks here.
    // TODO - put in instrumentation to track how far down this filter we typically go. Would help tweak perf.

    if (receivedEvent) {
        const cleanEvent = createCleanVersionOfEvent(receivedEvent, eventCriteriaMatcher.KNOWN_CRITERIA_KEY_VALUE_PAIRS, eventCriteriaMatcher.KNOWN_SYSTEM_FIELDS);

        if (cleanEvent && Object.keys(cleanEvent).length > 0) {

            const relevantCriteriaIds = eventCriteriaMatcher.lookupMatchingCriteria(cleanEvent);

            if (relevantCriteriaIds && relevantCriteriaIds.length > 0) {

                const criteria = await dbHelper.getSpecificCriteria(relevantCriteriaIds);

                const progressUpdatesToMake = computeProgressUpdatesToMake(cleanEvent, criteria);
                if (progressUpdatesToMake && progressUpdatesToMake.length > 0) {

                    updateEntityProgressTowardsGoals(progressUpdatesToMake);

                }

            }
        }
    }
}

function computeProgressUpdatesToMake(event, criteria) {
    const progressUpdates = [];

    if (criteria && criteria.length > 0) {
        for (const criterion of criteria) {

            const entityIdField = criterion.targetEntityIdField;
            const entityId = event[entityIdField];
            if (entityId && entityId.length > 0) {
                let progressUpdate = {
                    entityId: entityId,
                    goalId: criterion.goalId,
                    criterionId: criterion.id,
                    threshold: criterion.threshold
                };

                if (criterion.aggregation.type === "count") {
                    progressUpdate.aggregationValueToAdd = 1;
                } else if (criterion.aggregation.type === "sum") {
                    if (criterion.aggregation.value) {
                        progressUpdate.aggregationValueToAdd = criterion.aggregation.value;
                    } else if (event[criterion.aggregation.valueField]) {
                        progressUpdate.aggregationValueToAdd = event[criterion.aggregation.valueField];
                    } else {
                        logger.error(`Cannot compute sum aggregation value for criteria ${criterion.id} given for event[criterion.aggregation.valueField]=${event[criterion.aggregation.valueField]}. Using value of '1'.`);
                        progressUpdate.aggregationValueToAdd = 1;
                    }
                } else {
                    logger.error(`Unsupported aggregation type: ${criterion.aggregation.type}.`);
                }

                progressUpdates.push(progressUpdate);

            }
        }
    }

    return progressUpdates;
}

async function getReleventGoalsAndEntityProgressFromDb(progressUpdates) {
    const allImpactedEntityIds = progressUpdates.map(p => p.entityId);
    const relevantEntityProgressPromise = dbHelper.getSpecificEntitiesProgress(allImpactedEntityIds);
    const allRelevantGoalIds = progressUpdates.map(p => p.goalId);
    const relevantGoalsPromise = dbHelper.getSpecificGoals(allRelevantGoalIds);

    return Promise.all([relevantEntityProgressPromise, relevantGoalsPromise]);
}

function arrayToObjectWithIdKey(array, idField) {
    return array.reduce((result, item) => {
        result[item[idField]] = item;
        return result;
    }, {});
}


function updateEntityProgressForCriterion(entityProgress, progressUpdate) {

    const entityId = progressUpdate.entityId;
    const goalId = progressUpdate.goalId;
    const criterionId = progressUpdate.criterionId;
    const threshold = progressUpdate.threshold;

    entityHelper.initEntityProgressTowardsCriterion(entityProgress, entityId, goalId, criterionId);

    entityProgress[entityId].goals[goalId].criteriaIds[criterionId].value += Number(progressUpdate.aggregationValueToAdd);
    
    let hasMetThreshold = entityProgress[entityId].goals[goalId].criteriaIds[criterionId].value >= threshold;
    if (hasMetThreshold) {
        entityProgress[entityId].goals[goalId].criteriaIds[criterionId].isComplete = true;
    }
}

function updateEntityProgressForGoal(entityProgress, progressUpdate, goals) {

    const entityId = progressUpdate.entityId;
    const goalId = progressUpdate.goalId;

    // check if all goal requirements met, update if so
    if (!entityProgress[entityId].goals[goalId].isComplete) {
        let markGoalAsComplete = true;
        for (const thisCriterionId of goals[goalId].criteriaIds) {
            markGoalAsComplete = markGoalAsComplete && (entityProgress[entityId].goals[goalId].criteriaIds[thisCriterionId] && entityProgress[entityId].goals[goalId].criteriaIds[thisCriterionId].isComplete);
            if (!markGoalAsComplete) {
                break;
            }
        }
        if (markGoalAsComplete) {
            entityProgress[entityId].goals[goalId].isComplete = true;
            if ((goals[goalId].points != undefined) && !isNaN(goals[goalId].points)) {
                entityProgress[entityId].points += goals[goalId].points;
            }
        }
    }
}

async function updateEntityProgressTowardsGoals(progressUpdatesToMake) {

    // This update routine will introduce a race condition in a multi-node
    // setup. If two nodes invoke updateEntityProgress(), the second one will
    // win. This may be acceptable but needs to be documented and/or a 
    // good solution that doesn't compromise effiency should be researched.

    const dbInvocations = await getReleventGoalsAndEntityProgressFromDb(progressUpdatesToMake);
    const relevantEntityProgress = arrayToObjectWithIdKey(dbInvocations[0], "entityId");
    const relevantGoals = arrayToObjectWithIdKey(dbInvocations[1], "id");

    for (progressUpdate of progressUpdatesToMake) {
        updateEntityProgressForCriterion(relevantEntityProgress, progressUpdate);
        updateEntityProgressForGoal(relevantEntityProgress, progressUpdate, relevantGoals)
    }
    
    await dbHelper.updateMultipleEntityProgress(relevantEntityProgress);
}

function createCleanVersionOfEvent(receivedEvent, knownCriteriaKeyValuePairs, knownSystemFields) {
    let cleanEvent = {};

    for (let key in receivedEvent) {
        let cleanKey = eventFieldsHelper.generateCleanField(key);
        let cleanValue = eventFieldsHelper.generateCleanField(receivedEvent[key]);

        let keyValueCombo = eventFieldsHelper.generateNormalizedFieldValueKey(cleanKey, cleanValue);
        if (knownCriteriaKeyValuePairs[keyValueCombo] || knownSystemFields[cleanKey]) {
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