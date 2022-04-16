import { getEntityProgress } from '../database/db-helper.js';

async function getEntityProgressTowardsGoals(entityId, goalParams) {
    let entityProgress;    

    if (entityId?.length > 0) {
        entityProgress = await getEntityProgress(entityId, goalParams)
    }

    return entityProgress;
}

export {
    getEntityProgressTowardsGoals
};