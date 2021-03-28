const integrationTestHelper = require('./integration-test-helper');

async function addGoal(goal) {
    let pathAndParams = "goals";
    const headers = {"Content-Type": "application/json"};
    return integrationTestHelper.issueHttpPost(pathAndParams, goal, headers);
}

async function getGoals() {
    let pathAndParams = `goals`;
    return integrationTestHelper.issueHttpGet(pathAndParams);
}

async function setGoalState(goalId, state) {
    let pathAndParams = `goals/${goalId}/state`;
    const body = { state: state };
    const headers = {"Content-Type": "application/json"};
    return integrationTestHelper.issueHttpPost(pathAndParams, body, headers);
}

module.exports = {
    addGoal,
    getGoals,
    setGoalState
};