import express from 'express';
import { getEntityProgressTowardsGoals } from './entity-helper.js';

const router = express.Router();

// TODO authorize requests - put in common middleware?

router.get("/:entityId/progress/:goalId", async (request, response) => {

    const entity = await getEntityProgressTowardsGoals(request.params.entityId, request.params.goalId);
    if (entity) {
        response.status(200).send(entity);
    } else {
        response.status(404).send({ message: `no progress found for entity ${request.params.entityIdField}=${request.params.entityIdValue}.` });
    }
});

router.get("/:entityId/progress/", async (request, response) => {

    const entity = await getEntityProgressTowardsGoals(request.params.entityId);
    if (entity) {
        response.status(200).send(entity);
    } else {
        response.status(404).send({ message: `no progress found for entity ${request.params.entityIdField}=${request.params.entityIdValue}.` });
    }
});


export { router };