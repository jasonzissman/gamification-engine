const express = require('express');
const router = express.Router();
const eventProcessor = require('./event-processor');

/**
 * Note - Ideally, we would subscribe to a message broker (e.g. Kafka) for
 * inbound events. We introduce this REST endpoint as a testing utility
 * and to speed up development. 
 */

// Create a new event
// HTTP POST <host>/events/
router.post("/", async (request, response) => {

    let startTime = new Date().getTime();

    let retVal = { status: "received" };
    let promise = eventProcessor.processEvent(request.body);

    if (request.query.waitForEventToFinishProcessing) {
        retVal.completedUpdates = await promise;        
    }

    retVal.timingMs = (new Date().getTime() - startTime);

    response.status(200).send(retVal);
});

module.exports = router;