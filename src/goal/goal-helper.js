const { v4: uuidv4 } = require('uuid');

function isSafeCharacterSet(dataString) {
    return /^[a-z|0-9|_|-]+$/i.test(dataString);
}

function areAllFieldsAndValuesInSafeCharSet(object) {
    return /^[a-z|0-9|_|-]+$/i.test(JSON.stringify(object).replace(/[{}:",\[\]\s]/g, ''));
}

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
        isValid: false,
        message: "Goal validation failed. Ensure a valid goal is provided."
    };

    if (!newGoal || !newGoal.name || !newGoal.targetEntityId || !newGoal.criteria || !(newGoal.criteria.length > 0)) {
        retVal.message = "Must provide valid goal name, targetEntityId, and non-empty criteria.";
    } else if (!areAllFieldsAndValuesInSafeCharSet(newGoal)) {
        retVal.message = "Goal fields can only contain dashes (-), underscores (_), and alpha-numeric characters.";
    } else if (!areAllCriteriaValid(newGoal)) {
        retVal.message = "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.";
    } else {
        retVal.isValid = true;
        retVal.message = "ok";
    }

    return retVal;
}

function createGoalEntityFromRequestGoal(newGoal, criteriaIds) {
    return {
        id: uuidv4(),
        name: newGoal.name,
        targetEntityId: newGoal.targetEntityId,
        criteria: criteriaIds
    };
}

function createCriteriaEntityFromRequestGoal(newGoal) {
    const criteriaToPersist = [];

    return criteriaToPersist;
}

async function persistGoal(newGoal) {
    let retVal = {};

    const validationResult = validateGoal(newGoal);
    if (!validationResult.isValid) {
        retVal = validationResult;
    } else {
        // 1. Create criteria entities
        for (const criteria of newGoal.criteria) {
            
        }
        // 2. Create goal entity
        // createGoalEntityFromRequestGoal(newGoal, CRITERIA_IDS)
        
        // 3. Insert into DB in one command 
    }

    return retVal;
}

module.exports = { persistGoal, validateGoal, createGoalEntityFromRequestGoal, createCriteriaEntityFromRequestGoal };