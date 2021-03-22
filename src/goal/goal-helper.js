const { v4: uuidv4 } = require('uuid');
const eventCriteriaHelper = require('../event/event-criteria-matcher');
const dbHelper = require('../database/db-helper');
const eventFieldsHelper = require('../event/event-fields-helper');

function isSingleCriteriaValid(criteria) {
    let isValid = false;

    // TODO!!!! Test to make sure nested value not provided for any field
    if (criteria &&
        criteria.qualifyingEvent &&
        Object.keys(criteria.qualifyingEvent).length > 0 &&
        criteria.aggregation &&
        criteria.threshold) { // 0 is not a valid threshold!

        isValid = true;
    }

    return isValid;
}

function areAllCriteriaValid(newGoal) {

    let allCriteriaValid = true;

    for (const criteria of newGoal.criteria) {
        allCriteriaValid = allCriteriaValid && isSingleCriteriaValid(criteria);
        if (!allCriteriaValid) {
            break;
        }
    }
    return allCriteriaValid;
}

function validateGoal(newGoal) {
    let retVal = {
        status: "failed validation",
    };

    if (!newGoal || !newGoal.name || !newGoal.targetEntityId || !newGoal.criteria || !(newGoal.criteria.length > 0)) {
        retVal.message = "Must provide valid goal name, targetEntityId, and non-empty criteria.";
    } else if (!eventFieldsHelper.areAllFieldsAndValuesInSafeCharSet(newGoal)) {
        retVal.message = "Goal fields can only contain dashes (-), underscores (_), and alpha-numeric characters.";
    } else if (!areAllCriteriaValid(newGoal)) {
        retVal.message = "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.";
    } else {
        retVal.status = "ok";
    }

    return retVal;
}

function createGoalEntityFromRequestGoal(newGoal, criteriaIds) {
    return {
        id: uuidv4(),
        name: eventFieldsHelper.generateCleanField(newGoal.name),
        targetEntityId: eventFieldsHelper.generateCleanField(newGoal.targetEntityId),
        criteria: criteriaIds
    };
}

function createCriteriaEntityFromRequestGoal(newGoal) {
    const criteriaToPersist = [];

    for (const criteria of newGoal.criteria) {
        criteriaToPersist.push({
            id: uuidv4(),            
            targetEntityId: eventFieldsHelper.generateCleanField(newGoal.targetEntityId),
            qualifyingEvent: eventFieldsHelper.generateObjectWithCleanFields(criteria.qualifyingEvent),
            aggregation: eventFieldsHelper.generateCleanField(criteria.aggregation),
            threshold: Number(criteria.threshold)
        });
    }

    return criteriaToPersist;
}

async function persistGoal(newGoal) {
    let retVal = {};

    // TODO authorize request - put in middleware?
    
    const validationResult = validateGoal(newGoal);
    if (validationResult.status !== "ok") {
        retVal = {status: "bad_request", message: validationResult.message};
    } else {
        const criteriaEntities = createCriteriaEntityFromRequestGoal(newGoal);
        const criteriaIds = criteriaEntities.map(criteria => criteria.id);
        const goalEntity = createGoalEntityFromRequestGoal(newGoal, criteriaIds);
        criteriaEntities.forEach(criterion => {criterion.goalId = goalEntity.id});

        let insertionAttempt = await dbHelper.addNewGoalAndCriteria(goalEntity, criteriaEntities);
        if (insertionAttempt.status === "ok") {
            eventCriteriaHelper.addNewCriteriaToLookupMap(criteriaEntities);
            retVal = { status: "ok"};
        } else {
            retVal = { status: "failed", message: insertionAttempt.message};
        }
    }

    return retVal;
}

module.exports = { 
    persistGoal, 
    validateGoal, 
    createGoalEntityFromRequestGoal, 
    createCriteriaEntityFromRequestGoal 
};