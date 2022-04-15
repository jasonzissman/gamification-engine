import { issueHttpPost, issueHttpGet } from './integration-test-helper.js';

async function addGoal(goal) {
    let pathAndParams = "api/v1/goals";
    const headers = {"Content-Type": "application/json"};
    return issueHttpPost(pathAndParams, goal, headers);
}

async function getGoals() {
    let pathAndParams = `api/v1/goals`;
    return issueHttpGet(pathAndParams);
}

export {
    addGoal,
    getGoals
};