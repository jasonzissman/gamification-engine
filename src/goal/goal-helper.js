const eventCriteriaHelper = require('../event/event-criteria-matcher');
const dbHelper = require('../database/db-helper');
const eventFieldsHelper = require('../event/event-fields-helper');

function isAggregationValid(aggregation) {
    let isValid = aggregation && aggregation.type;

    if (isValid && aggregation.type === "sum") {
        // For sum aggregations, must provide value to add or field from which to pull value
        isValid = (aggregation.valueField) || (aggregation.value && Number(aggregation.value)); // 0 is not a valid value
    }

    return isValid;
}

function isSingleCriteriaValid(criteria) {
    let isValid = false;

    // TODO!!!! Test to make sure nested value not provided for any field
    if (criteria &&
        criteria.qualifyingEvent &&
        Object.keys(criteria.qualifyingEvent).length > 0 &&
        isAggregationValid(criteria.aggregation) &&
        criteria.threshold) {// 0 is not a valid threshld!

        isValid = true;
    }

    return isValid;
}

function isValidStateUpdateRequest(goalId, state) {
    let isValid = false;
    if (goalId && (state == "disabled" || state == "enabled")) {
        isValid = true;        
    }
    return isValid;
}
async function updateGoalState(goalId, state) {
    let retVal = {};

    if (!isValidStateUpdateRequest(goalId, state)) {
        retVal.status = "bad_arguments";
    } else {
        const goal = await getSpecificGoal(goalId);
        if (!goal) {
            retVal.status = "not_found";
        } else {
            await dbHelper.updateGoalState(goalId, state);
            // TODO - optimization - insert or remove from lookup maps
            retVal.status = "ok";
        }
    }

    return retVal;
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

function isGoalPointsValueValid(newGoal) {
    return ((newGoal.points == undefined) || !isNaN(newGoal.points));
}

function validateGoal(newGoal) {
    let retVal = {
        status: "failed validation",
    };

    if (!newGoal || !newGoal.name || !newGoal.targetEntityIdField || !newGoal.criteria || !(newGoal.criteria.length > 0)) {
        retVal.message = "Must provide valid goal name, targetEntityIdField, and non-empty criteria.";
    } else if (!areAllCriteriaValid(newGoal)) {
        retVal.message = "All criteria should have a valid aggregation, a valid threshold, and non-nested qualifying events with at least one name/value attribute.";
    } else if (!isGoalPointsValueValid(newGoal)) {
        retVal.message = `If specifying a point value for a goal, it must be a number. Assigned invalid value: '${newGoal.points}'.`;
    } else {
        retVal.status = "ok";
    }

    return retVal;
}

function createGoalEntityFromRequestGoal(newGoal) {
    let retVal = {
        name: eventFieldsHelper.generateCleanField(newGoal.name),
        targetEntityIdField: eventFieldsHelper.generateCleanField(newGoal.targetEntityIdField),
        state: "enabled"
    };
    if (newGoal.description) {
        retVal.description = eventFieldsHelper.generateCleanField(newGoal.description);
    }
    if (newGoal.points) {
        retVal.points = Number(newGoal.points);
    }
    return retVal;
}

function createCriteriaEntityFromRequestGoal(newGoal) {
    const criteriaToPersist = [];

    for (const criteria of newGoal.criteria) {
        const cleanCriteria = {
            targetEntityIdField: eventFieldsHelper.generateCleanField(newGoal.targetEntityIdField),
            qualifyingEvent: eventFieldsHelper.generateObjectWithCleanFields(criteria.qualifyingEvent),
            aggregation: eventFieldsHelper.generateObjectWithCleanFields(criteria.aggregation),
            threshold: Number(criteria.threshold)
        };
        criteriaToPersist.push(cleanCriteria);
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
            let resultingGoal = await dbHelper.updateGoalCriteria(insertedGoalId, insertedCriteriaIds);

            eventCriteriaHelper.addNewCriteriaToLookupMap(criteriaEntities);
            retVal = { status: "ok", goal: resultingGoal };
        } catch (err) {
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
    getAllCriteriaForGoal,
    updateGoalState
};