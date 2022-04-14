import { issueHttpGet } from './integration-test-helper.js';

async function getProgress(entityIdField, entityIdValue, goalId) {
    let pathAndParams = `entities/${entityIdField}/${entityIdValue}/progress/${goalId}`;
    return issueHttpGet(pathAndParams);
}


export {
    getProgress
};