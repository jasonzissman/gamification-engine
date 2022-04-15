import express from 'express';
import { getEntityProgressTowardsGoals } from './entity-helper.js';

const router = express.Router();

// TODO authorize requests - put in common middleware?

router.get("/:entityIdField/:entityIdValue/progress/:goalId", async (request, response) => {

    const entity = await getEntityProgressTowardsGoals(request.params.entityIdField, request.params.entityIdValue, request.params.goalId);
    if (entity) {
        response.status(200).send(entity);
    } else {
        response.status(404).send({ message: `no progress found for entity ${request.params.entityIdField}=${request.params.entityIdValue}.` });
    }
});

router.get("/:entityIdField/:entityIdValue/progress/", async (request, response) => {

    const entity = await getEntityProgressTowardsGoals(request.params.entityIdField, request.params.entityIdValue);
    if (entity) {
        response.status(200).send(entity);
    } else {
        response.status(404).send({ message: `no progress found for entity ${request.params.entityIdField}=${request.params.entityIdValue}.` });
    }
});


export { router };