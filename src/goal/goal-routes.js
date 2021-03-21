const express = require('express');
const router = express.Router();
const goalHelper = require('./goal-helper.js');

// HTTP POST <host>/goals/
router.post("/", async (request, response) => {
    let outcome = await goalHelper.persistGoal(goal);

    if (outcome.message=== "successful") {
        response.status(200).send({ status: "ok" });
    } else  if (outcome.message === "bad_request") {
        response.status(400).send({ status: "failed" });
    } else  if (outcome.message === "unauthorized") {
        response.status(401).send({ status: "failed" });
    } else  if (outcome.message === "forbidden") {
        response.status(403).send({ status: "failed" });
    } else {
        response.status(500).send({ status: "failed" });
    }
});

// HTTP PUT <host>/goals/<goal-id>
router.put("/:goalId", (request, response) => {
    // TODO invoke goal update routine
    response.status(200).send({ status: "ok" });
});

// HTTP GET <host>/goals/
router.get("/", (request, response) => {
    // TODO invoke goal fetch-all routine
    response.status(200).send({ status: "ok" });
});

module.exports = router;