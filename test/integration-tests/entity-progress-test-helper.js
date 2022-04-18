import { issueHttpGet } from './integration-test-helper.js';

async function getProgress(entityId, goalId, onlyComplete) {
    let pathAndParams = `api/v1/entities/${entityId}/progress`;
    if (goalId) {
        pathAndParams += `/${goalId}`;
    } else if (onlyComplete) {
        pathAndParams += `?onlyComplete=true`
    }
    return issueHttpGet(pathAndParams);
}


export {
    getProgress
};