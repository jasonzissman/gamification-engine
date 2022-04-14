import express from 'express';
import { processActivity } from './activity-processor.js';

const router = express.Router();

/**
 * Note - Ideally, we would subscribe to a message broker (e.g. Kafka) for
 * inbound events. We introduce this REST endpoint as a testing utility
 * and to speed up development. 
 */

// Create a new activity
router.post("/", async (request, response) => {

    // TODO authorize request - put in middleware?

    let startTime = new Date().getTime();

    let retVal = { status: "received" };
    let promise = processActivity(request.body);

    if (request.query.waitForEventToFinishProcessing) {
        retVal.completedUpdates = await promise;
        retVal.timingMs = (new Date().getTime() - startTime);
    }

    response.status(200).send(retVal);
});

export { router };