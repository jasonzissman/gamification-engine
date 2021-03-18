const express = require('express');
const router = express.Router();

/**
 * Note - Ideally, we would subscribe to a message broker (e.g. Kafka) for
 * inbound events. We introduce this REST endpoint as a testing utility
 * and to speed up development. 
 */

router.post("/", (request, response) => {
    // TODO invoke event processing routine
    response.status(200).send({ status: "received" });
});

module.exports = router;