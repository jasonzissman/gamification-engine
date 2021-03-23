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
        criteria.aggregationValue && // 0 is not a valid agg value!
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

function createGoalEntityFromRequestGoal(newGoal) {
    return {
        name: eventFieldsHelper.generateCleanField(newGoal.name),
        targetEntityId: eventFieldsHelper.generateCleanField(newGoal.targetEntityId)
    };
}

function createCriteriaEntityFromRequestGoal(newGoal) {
    const criteriaToPersist = [];

    for (const criteria of newGoal.criteria) {
        criteriaToPersist.push({
            targetEntityId: eventFieldsHelper.generateCleanField(newGoal.targetEntityId),
            qualifyingEvent: eventFieldsHelper.generateObjectWithCleanFields(criteria.qualifyingEvent),
            aggregation: eventFieldsHelper.generateCleanField(criteria.aggregation),
            aggregationValue: Number(criteria.aggregationValue),
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
        retVal = { status: "bad_request", message: validationResult.message };
    } else {
        const criteriaEntities = createCriteriaEntityFromRequestGoal(newGoal);

        const goalEntity = createGoalEntityFromRequestGoal(newGoal);

        try {
            let insertedGoalId = await dbHelper.persistGoal(goalEntity);
            criteriaEntities.forEach(criterion => { criterion.goalId = insertedGoalId });
            
            let insertedCriteriaIds = await dbHelper.persistCriteria(criteriaEntities);
            await dbHelper.updateGoalCriteria(insertedGoalId, insertedCriteriaIds);
            
            eventCriteriaHelper.addNewCriteriaToLookupMap(criteriaEntities);
            retVal = { status: "ok" };
        } catch(err) {
            retVal = { status: "failed", message: "Failed to add goal to database." };
        }
    }

    return retVal;
}

async function getAllGoals() {
    return dbHelper.getAllGoals();
}

async function getSpecificGoal(goalId) {
    let goal;

    if (goalId && goalId.length > 0) {
        goal = await dbHelper.getSpecificGoal(goalId);
    }

    return goal;
}

async function getAllCriteriaForGoal(goalId) {
    let relevantCriteria = [];

    if (goalId && goalId.length > 0) {
        relevantCriteria = await dbHelper.getAllCriteriaForGoal(goalId);
    }

    return relevantCriteria;
}

module.exports = {
    persistGoal,
    validateGoal,
    createGoalEntityFromRequestGoal,
    createCriteriaEntityFromRequestGoal,
    getAllGoals,
    getSpecificGoal,
    getAllCriteriaForGoal
};