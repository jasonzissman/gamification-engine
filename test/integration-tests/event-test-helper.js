const integrationTestHelper = require('./integration-test-helper');

async function sendEvent(event, waitForEventToFinishProcessing) {
    let pathAndParams = "events";
    if(waitForEventToFinishProcessing) {
        pathAndParams += "?waitForEventToFinishProcessing=true";
    }
    const headers = {"Content-Type": "application/json"};
    return integrationTestHelper.issueHttpPost(pathAndParams, event, headers);    
}

module.exports = {
    sendEvent
};