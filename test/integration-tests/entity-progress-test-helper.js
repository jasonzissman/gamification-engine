const integrationTestHelper = require('./integration-test-helper');

async function getProgress(entityIdField, entityIdValue) {
    let pathAndParams = `entities/${entityIdField}/${entityIdValue}/progress`;
    return integrationTestHelper.issueHttpGet(pathAndParams);
}


module.exports = {
    getProgress
};