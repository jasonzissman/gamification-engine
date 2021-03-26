const logger = require('../utility/logger.js');
const dbHelper = require('../database/db-helper');

async function getEntityProgress(entityId) {
    let entityProgress;

    if (entityId && entityId.length > 0) {
        entityProgress = await dbHelper.getSpecificEntityProgress(entityId)
    }
    if (!entityProgress) {
        logger.info(`Unable to find entity '${entityId}' in DB.`);
    }

    return entityProgress;
}

function createNewEntity(entityId) {
    return {
        entityId: entityId,
        goals: {},
        points: 0
    };
}

function createNewGoalProgress() {
    return {
        isComplete: false,
        criteriaIds: {}
    };
}

function createNewCriteriaProgress() {
    return {
        isComplete: false,
        value: 0
    };
}

function initEntityProgressTowardsCriterion(entityMap, entityId, goalId, criterionId) {

    if (!entityMap[entityId]) {
        entityMap[entityId] = createNewEntity(entityId);
    }
    if (!entityMap[entityId].goals[goalId]) {
        entityMap[entityId].goals[goalId] = createNewGoalProgress();
    }
    if (!entityMap[entityId].goals[goalId].criteriaIds[criterionId]) {
        entityMap[entityId].goals[goalId].criteriaIds[criterionId] = createNewCriteriaProgress();
    }
}

function areUpdateBalanceRequestParamsValid(entityId, amount) {
    return entityId && (amount != undefined) && !isNaN(amount);
}

async function modifyPointsBalance(entityId, amount) {
    let retVal = {};
    if (!areUpdateBalanceRequestParamsValid(entityId, amount)) {
        retVal.status = "invalid arguments";
        retVal.message = `Must provide a valid entityID and numeric amount. Provided arguments: entityId=${entityId} and amount=${amount}.`;
    } else {
        let entity = await getEntityProgress(entityId);
        if (!entity) {
            entity = createNewEntity(entityId);
        }
        entity.points += amount;
        let updatedEntity = await dbHelper.updateEntityProgress(entity);
        retVal.status = "ok";
        retVal.message = { updatedEntity: updatedEntity };
    }
    return retVal;
}

module.exports = {
    getEntityProgress,
    initEntityProgressTowardsCriterion,
    modifyPointsBalance
};