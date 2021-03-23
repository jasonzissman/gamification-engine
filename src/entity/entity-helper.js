const logger = require('../utility/logger.js');
const dbHelper = require('../database/db-helper');

async function getEntityProgress(entityId) {
    let entityProgress;

    if (entityId && entityId.length > 0) {
        entityProgress = await dbHelper.getSpecificEntityProgress(entityId)        
    } else {
        logger.info(`Unable to find entity '${entityId}' in DB.`);
    }

    return entityProgress;
}

module.exports = {
    getEntityProgress
};