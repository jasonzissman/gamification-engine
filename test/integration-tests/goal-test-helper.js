import { issueHttpPost, issueHttpGet } from './integration-test-helper.js';

async function addGoal(goal) {
    let pathAndParams = "goals";
    const headers = {"Content-Type": "application/json"};
    return issueHttpPost(pathAndParams, goal, headers);
}

async function getGoals() {
    let pathAndParams = `goals`;
    return issueHttpGet(pathAndParams);
}

export {
    addGoal,
    getGoals
};