const goalHelper = require('../goal/goal-helper');

function processEvent(receivedEvent) {
    // TODO authorize request - put in middleware?

    if (receivedEvent) {
        // TODO reduce to only fields known to be in criteria
        let eventCloneWithKnownFields = {};

        // TODO cleanse data to only be acceptable alphabet
        for(let key in eventCloneWithKnownFields) {
        }

        // TODO find relevant criteria IDs from lookup map

        // TODO if relevant criteria IDs found, update progress for this entityID towards those goals
    }

}

module.exports = { processEvent };