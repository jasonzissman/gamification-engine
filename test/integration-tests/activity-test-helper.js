import { issueHttpPost } from './integration-test-helper.js';

async function sendEvent(event, waitForEventToFinishProcessing) {
    let pathAndParams = "api/v1/activities";
    if(waitForEventToFinishProcessing) {
        pathAndParams += "?waitForEventToFinishProcessing=true";
    }
    const headers = {"Content-Type": "application/json"};
    return issueHttpPost(pathAndParams, event, headers);    
}

export {
    sendEvent
};