import express from 'express';
import fs from 'fs';
import { Validator as SchemaValidator } from "express-json-validator-middleware";
import { persistGoal, getGoal } from './goal-helper.js';

const router = express.Router();
const { validate } = new SchemaValidator()
var goalSchema = JSON.parse(fs.readFileSync(`src/schemas/goal.schema.json`));

// Create a new goal
// HTTP POST <host>/goals/
router.post("/", validate({ body: goalSchema }), async (request, response) => {
    // TODO validate payload not too big
    // TODO authorize request - put in middleware?

    let outcome = await persistGoal(request.body);

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

// Get specific goal
// HTTP GET <host>/goals/<goalID>/
router.get("/:goalId", async (request, response) => {
    // TODO authorize request - put in middleware?

    const goal = await getGoal(request.params.goalId);
    if (goal) {
        response.status(200).send(goal);
    } else {
        response.status(404).send({ status: `Goal ${request.params.goalId} not found.` });
    }
});


export { router };