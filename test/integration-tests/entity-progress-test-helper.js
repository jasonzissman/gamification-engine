import { issueHttpGet } from './integration-test-helper.js';

async function getProgress(entityId, goalId) {
    let pathAndParams = `api/v1/entities/${entityId}/progress`;
    if (goalId) {
        pathAndParams += `/${goalId}`;
    }
    return issueHttpGet(pathAndParams);
}


export {
    getProgress
};