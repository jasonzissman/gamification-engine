import { issueHttpGet } from './integration-test-helper.js';

async function getProgress(entityIdField, entityIdValue, goalId) {
    let pathAndParams = `api/v1/entities/${entityIdField}/${entityIdValue}/progress`;
    if (goalId) {
        pathAndParams += `/${goalId}`;
    }
    return issueHttpGet(pathAndParams);
}


export {
    getProgress
};