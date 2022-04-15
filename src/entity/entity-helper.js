import { getEntityProgress } from '../database/db-helper.js';

async function getEntityProgressTowardsGoals(entityId, goalId) {
    let entityProgress;    

    if (entityId?.length > 0) {
        entityProgress = await getEntityProgress(entityId, goalId)
    }

    return entityProgress;
}

export {
    getEntityProgressTowardsGoals
};