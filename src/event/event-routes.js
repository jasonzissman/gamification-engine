const express = require('express');
const router = express.Router();
const eventProcessor = require('./event-processor');

/**
 * Note - Ideally, we would subscribe to a message broker (e.g. Kafka) for
 * inbound events. We introduce this REST endpoint as a testing utility
 * and to speed up development. 
 */

router.post("/", (request, response) => {
    // TODO validate payload not too big
    eventProcessor.processEvent(request.body);
    // Immediately return 200 regardless of result
    response.status(200).send({ status: "received" });
});

module.exports = router;