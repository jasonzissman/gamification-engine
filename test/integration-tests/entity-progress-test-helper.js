const integrationTestHelper = require('./integration-test-helper');

async function getProgress(entityId) {
    let pathAndParams = `entities/${entityId}`;
    return integrationTestHelper.issueHttpGet(pathAndParams);
}

async function modifyPoints(entityId, amount) {
    let pathAndParams = `entities/${entityId}/points`;
    const headers = { "Content-Type": "application/json" };
    return integrationTestHelper.issueHttpPost(pathAndParams, { amount: amount }, headers);
}

module.exports = {
    getProgress,
    modifyPoints
};