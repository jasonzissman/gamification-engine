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

module.exports = {
    addGoal,
    getGoals
};