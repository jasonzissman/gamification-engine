const integrationTestHelper = require('./integration-test-helper');

async function sendEvent(event) {
    let pathAndParams = "event";
    const headers = {"Content-Type": "application/json"};
    return integrationTestHelper.issueHttpPost(pathAndParams, event, headers);
}

module.exports = {
    sendEvent
};