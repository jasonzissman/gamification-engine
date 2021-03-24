const express = require('express');
const entityHelper = require('./entity-helper');

const router = express.Router();

router.get("/:entityId/progress", async (request, response) => {
    // TODO authorize request - put in common middleware?
    const entity = await entityHelper.getEntityProgress(request.params.entityId);
    if (entity) {
        response.status(200).send(entity);
    } else {
        response.status(404).send({message: `no progress found for entity ${request.params.entityId}.`});
    }
});

module.exports = router;