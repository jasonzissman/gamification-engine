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

// Update existing goal
// HTTP PUT <host>/goals/<goal-id>
router.put("/:goalId", (request, response) => {
    // TODO invoke goal update routine
    response.status(200).send({ status: "ok" });
});

// Get goals
// HTTP GET <host>/goals/
router.get("/", (request, response) => {
    // TODO invoke goal fetch-all routine
    response.status(200).send({ status: "ok" });
});

module.exports = router;