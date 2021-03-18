async function persistGoal(newGoal) {
    let retVal = {};

    return retVal;
}

function isSafeCharacterSet(dataString) {
    return /^[a-z|0-9|_|-]+$/i.test(dataString);
}

function areAllFieldsAndValuesInSafeCharSet(object) {
    return /^[a-z|0-9|_|-]+$/i.test(JSON.stringify(object).replace(/[{}:",\[\]\s]/g, ''));
}

function isSingleCriteriaValid(criteria) {
    let isValid = false;

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
        retVal.message = "All criteria should have qualifying events with at least one name/value attribute, a valid aggregation, and a valid threshold.";
    } else {
        retVal.isValid = true;
        retVal.message = "ok";
    }

    return retVal;
}

module.exports = { persistGoal, validateGoal };