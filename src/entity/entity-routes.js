const express = require('express');
const entityHelper = require('./entity-helper');

const router = express.Router();

router.get("/:entityId", async (request, response) => {
    // TODO authorize request - put in common middleware?
    const entity = await entityHelper.getEntityProgress(request.params.entityId);
    if (entity) {
        response.status(200).send(entity);
    } else {
        response.status(404).send({message: `no progress found for entity ${request.params.entityId}.`});
    }
});

// increment/decrement points for entity
router.post("/:entityId/points", async (request, response) => {
    // TODO authorize request - put in common middleware?
    const result = await entityHelper.modifyPointsBalance(request.params.entityId, request.body.amount);
    if (result.status === "invalid arguments") {
        response.status(400).send(result.message);
    } else {
        response.status(200).send(result.message);
    }
});

module.exports = router;