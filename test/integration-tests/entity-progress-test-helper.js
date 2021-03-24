const integrationTestHelper = require('./integration-test-helper');

async function getProgress(entityId) {
    let pathAndParams = `entity/${entityId}/progress`;
    return integrationTestHelper.issueHttpGet(pathAndParams);
}

module.exports = {
    getProgress
};