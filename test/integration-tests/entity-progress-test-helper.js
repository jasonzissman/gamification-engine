const integrationTestHelper = require('./integration-test-helper');

async function getProgress(entityId) {
    let pathAndParams = `entity/${entityId}`;
    return integrationTestHelper.issueHttpGet(pathAndParams);
}

async function updatePoints(entityId, amount) {
    let pathAndParams = `entity/${entityId}/points`;
    const headers = { "Content-Type": "application/json" };
    return integrationTestHelper.issueHttpPost(pathAndParams, { amount: amount }, headers);
}

module.exports = {
    getProgress,
    updatePoints
};