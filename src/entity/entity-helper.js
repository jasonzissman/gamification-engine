const logger = require('../utility/logger.js');
const dbHelper = require('../database/db-helper');

async function getEntityProgress(entityIdField, entityIdValue) {
    let entityProgress;

    if (entityIdField && entityIdField.length > 0 && entityIdValue && entityIdValue.length > 0) {
        entityProgress = await dbHelper.getSpecificEntityProgress(entityIdField, entityIdValue)
    }
    if (!entityProgress) {
        logger.info(`Unable to find entity '${entityIdField}=${entityIdValue}' in DB.`);
    }

    return entityProgress;
}

module.exports = {
    getEntityProgress
};