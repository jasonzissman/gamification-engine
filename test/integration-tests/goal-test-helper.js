const integrationTestHelper = require('./integration-test-helper');

async function addGoal(goal) {
    let pathAndParams = "goal";
    const headers = {"Content-Type": "application/json"};
    return integrationTestHelper.issueHttpPost(pathAndParams, goal, headers);
}

module.exports = {
    addGoal
};