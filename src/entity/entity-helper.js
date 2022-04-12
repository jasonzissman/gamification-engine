import { getEntityProgress } from '../database/db-helper.js';

async function getEntityProgressTowardsGoal(entityIdField, entityIdValue, goalId) {
    let entityProgress;

    if (entityIdField?.length > 0 && entityIdValue?.length > 0 && goalId?.length > 0) {
        entityProgress = await getEntityProgress(entityIdField, entityIdValue, goalId)
    }

    return entityProgress;
}

export {
    getEntityProgressTowardsGoal
};