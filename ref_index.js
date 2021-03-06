// const express = require('express');
// const app = express();
// const { v4: uuidv4 } = require('uuid');

// app.use(express.json());

// /////////////////////////////////////////////

// let BADGES_DATABASE = [];

// let ENTITY_BADGE_STATUS_DATABASE = {};

// ///////////////////////////////

// app.post('/badges', (request, response) => {

//     // TODO validate input
//     // TODO ensure authorized request
//     // TODO OPTIMIZATION only allow badges for certain events. This will let us filter events more easily when processing.

//     let newBadge = request.body;
//     let badgeId = uuidv4();
//     newBadge["id"] = badgeId;

//     // TODO add id for each badge criteria
//     for (let badgeCriteria of newBadge.criteria) {
//         badgeCriteria["id"] = uuidv4();
//     }

//     BADGES_DATABASE.push(newBadge)

//     response.send({ "status": `created badge ${badgeId}` });
// });

// function doesEventMatchAllRequiredCriteriaFields(event, badgeCriteria) {

//     let doesMatch = true;

//     for (const eventField in badgeCriteria.qualifyingEvents) {

//         let eventFieldValue = event[eventField];
//         let criteriaFieldArray = badgeCriteria.qualifyingEvents[eventField];

//         let doesMatchAtLeastOneArrayValue = false;
//         for (criteriaFieldValue of criteriaFieldArray) {
//             // See if event value is in the array of qualifying criteria values
//             if(eventFieldValue == criteriaFieldValue) {
//                 doesMatchAtLeastOneArrayValue = true;
//                 break;
//             }
//         }

//         if (!doesMatchAtLeastOneArrayValue) {
//             doesMatch = false;
//             break;
//         }
//     }

//     return doesMatch;
// }

// function fetchRelevantBadgesFromDb(event) {

//     /*
//      * Performance is critical for this area of the code. Our system will be
//      * receiving hundreds or thousands of events per second and we want
//      * to filter out the noise as quickly as possible. Relevant badge lookup
//      * must be performed very quickly. 
//      */

//     let relevantBadges = [];
//     for (let badgeFromDatabase of BADGES_DATABASE) {

//         if (true /** TODO check if date requirements met **/) {

//             for (let badgeCriteria of badgeFromDatabase.criteria) {

//                 let isBadgeCriteriaRelevant = doesEventMatchAllRequiredCriteriaFields(event, badgeCriteria);
//                 if (isBadgeCriteriaRelevant) {
//                     relevantBadges.push(badgeFromDatabase);
//                     break; // At least one criteria is relevant, no need to check others
//                 }
//             }
//         }
//     }
//     return relevantBadges;
// }

// app.post('/events', (request, response) => {

//     // TODO validate input
//     // TODO ensure authorized request
//     // TODO client must provide 'action' and 'timestamp' fields in event 
//     // timestamp is required since event could be queued in kafka for
//     // non-trivial time

//     // TODO OPTIMIZATION filter out events from districts not paying for this service.

//     let retVal = { "notifications": [] };

//     // Event received from clients
//     let event = request.body;

//     // Look up any active and relevant badges in the DB for this event
//     let relevantBadges = fetchRelevantBadgesFromDb(event);

//     if (relevantBadges && relevantBadges.length > 0) {
                
//         for (let badge of relevantBadges) {

//             let entityId = event[badge["targetEntityKey"]];
//             let entityBadgeProgress = ENTITY_BADGE_STATUS_DATABASE[entityId];

//             // It not found in DB, we have to make a new entity to track progress towards this badge
//             if (!entityBadgeProgress) {
//                 entityBadgeProgress = {
//                     "entityId": entityId,
//                     "points": 0,
//                     "badges": {} // object, not array, for easier lookup
//                 };
//             }

//             // Let's see if the entity has any progress towards this badge in particular.
//             if (!entityBadgeProgress.badges[badge.id]) {

//                 // Nope! No progress so far. Let's default some values.
//                 entityBadgeProgress.badges[badge.id] = {
//                     completed: false,
//                     criteria: {}
//                 };
//             }

//             let haveAllCriteriaBeenMet = true;
//             for (let badgeCriteria of badge.criteria) {

//                 // Update progress towards each badge criteria
//                 if (!entityBadgeProgress.badges[badge.id]["criteria"][badgeCriteria.id]) {
//                     entityBadgeProgress.badges[badge.id]["criteria"][badgeCriteria.id] = {
//                         value: 0,
//                         completed: false
//                     };
//                 }

//                 let doesEventSatisfyCriteria = doesEventMatchAllRequiredCriteriaFields(event, badgeCriteria);
//                 if (doesEventSatisfyCriteria) {

//                     if (badgeCriteria.aggregation === "count") {
//                         // If a 'count' rule, then we increment our count by 1 for this event.
//                         entityBadgeProgress.badges[badge.id]["criteria"][badgeCriteria.id].value += 1;
//                     } else {
//                         // Add support here for 'sum' (one use case would be to get total minutes spent reading book) 
//                     }

//                     // Finally, determine if the badge criteria have been fulfilled now that our event data has been updated
//                     if (badgeCriteria.aggregation === "count") {
//                         let hasBadgeCriteriaAlreadyBeenCompleted = entityBadgeProgress.badges[badge.id]["criteria"][badgeCriteria.id].completed;
//                         if (!hasBadgeCriteriaAlreadyBeenCompleted) {
//                             let hasUserFulfilledCriteriaCountRules = badgeCriteria.threshold.type === "minimum" && entityBadgeProgress.badges[badge.id]["criteria"][badgeCriteria.id].value >= badgeCriteria.threshold.value;
//                             if (hasUserFulfilledCriteriaCountRules) {
//                                 entityBadgeProgress.badges[badge.id]["criteria"][badgeCriteria.id].completed = true;
//                             }
//                         }
//                     }
//                 }

//                 haveAllCriteriaBeenMet = haveAllCriteriaBeenMet && entityBadgeProgress.badges[badge.id]["criteria"][badgeCriteria.id].completed;
//             }

//             if (haveAllCriteriaBeenMet && !entityBadgeProgress.badges[badge.id].completed) {

//                 // Success!!! 
//                 // Send an alert that the badge has been achieved!

//                 if (badge.points > 0) {
//                     entityBadgeProgress.points += badge.points;
//                 }
//                 entityBadgeProgress.badges[badge.id].completed = true;
//                 retVal["notifications"].push(`Successfully completed badge '${badge.name}'.`);
//             }

//             ENTITY_BADGE_STATUS_DATABASE[entityBadgeProgress.entityId] = entityBadgeProgress;

//         }
        
//     }

//     retVal["status"] = "ok";
//     response.send(retVal);
// });

// app.get("/entity-badge-status/:id", (request, response) => {
//     response.send(ENTITY_BADGE_STATUS_DATABASE[request.params.id]);
// });

// app.listen(3000);
