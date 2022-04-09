const logger = require('../utility/logger.js');
const dbHelper = require('../database/db-helper');

async function getEntityProgress(entityIdField, entityIdValue) {
    let entityProgress;

    if (entityIdField && entityIdField.length > 0 && entityIdValue && entityIdValue.length > 0) {
        entityProgress = await dbHelper.getSpecificEntityProgress(entityIdField, entityIdValue)
    }
    
    return entityProgress;
}

module.exports = {
    getEntityProgress
};