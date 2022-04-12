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

async function setGoalState(goalId, state) {
    let pathAndParams = `goals/${goalId}/state`;
    const body = { state: state };
    const headers = {"Content-Type": "application/json"};
    return issueHttpPost(pathAndParams, body, headers);
}

export {
    addGoal,
    getGoals,
    setGoalState
};