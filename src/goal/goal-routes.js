const express = require('express');
const router = express.Router();
const goalHelper = require('./goal-helper.js');

// Create a new goal
// HTTP POST <host>/goal/
router.post("/", async (request, response) => {
    // TODO validate payload not too big
    let outcome = await goalHelper.persistGoal(request.body);

    if (outcome.status === "ok") {
        response.status(200).send(outcome);
    } else if (outcome.status === "bad_request") {
        response.status(400).send(outcome);
    } else if (outcome.status === "unauthorized") {
        response.status(401).send(outcome);
    } else if (outcome.status === "forbidden") {
        response.status(403).send(outcome);
    } else {
        response.status(500).send({ status: "server error" });
    }
});

// // Update existing goal
// // HTTP PUT <host>/goals/<goal-id>
// router.put("/:goalId", (request, response) => {
//     // TODO invoke goal update routine
//     response.status(200).send({ status: "ok" });
// });

// Get goals
// HTTP GET <host>/goals/
router.get("/", async (request, response) => {
    const allGoals = await goalHelper.getAllGoals();
    response.status(200).send(allGoals);
});

// Get specific goal metadata
// HTTP GET <host>/goals/<goalID>/
router.get("/:goalId", async (request, response) => {
    const goal = await goalHelper.getSpecificGoal(request.params.goalId);
    if (goal) {
        response.status(200).send(goal);
    } else {
        response.status(404).send({status: `Goal ${request.params.goalId} not found.`});
    }
});

// Get criteria for specific goal
// HTTP GET <host>/goals/<goalID>/criteria
router.get("/:goalId/criteria", async (request, response) => {
    const allCriteriaForGoal = await goalHelper.getAllCriteriaForGoal(request.params.goalId);
    if (allCriteriaForGoal) {
        response.status(200).send(allCriteriaForGoal);
    } else {
        response.status(404).send({status: `Goal ${request.params.goalId} not found.`});
    }
});

module.exports = router;