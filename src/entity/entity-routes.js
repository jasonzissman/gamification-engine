import express from 'express';
import { getEntityProgressTowardsGoal } from './entity-helper.js';

const router = express.Router();

router.get("/:entityIdField/:entityIdValue/:goalId", async (request, response) => {
    // TODO authorize request - put in common middleware?

    const entity = await getEntityProgressTowardsGoal(request.params.entityIdField, request.params.entityIdValue, request.params.goalId);
    if (entity) {
        response.status(200).send(entity);
    } else {
        response.status(404).send({ message: `no progress found for entity ${request.params.entityIdField}=${request.params.entityIdValue}.` });
    }
});


export { router };