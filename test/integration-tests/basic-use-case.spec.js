import { v4 as uuidv4 } from "uuid";
import neo4j from "neo4j-driver";
import { Neo4jContainer } from "testcontainers";
import assert from 'assert';

import { addGoal } from './goal-test-helper.js';
import { startTestAppServer, stopAppServer, assertEqualEntityProgress } from './integration-test-helper.js';
import { sendEvent } from './activity-test-helper.js';
import { getProgress } from './entity-progress-test-helper.js';
import { log } from '../../src/utility/logger.js'

// TODO - switch to Jest - Easier syntax and allows proper shutdown of express

describe('Basic Use Cases', function () {

    let neo4jTestInstance;
    let neo4jDriver;

    this.timeout(240000);

    this.beforeAll(async () => {
        log(`starting neo4j test container`)
        neo4jTestInstance = await new Neo4jContainer().withApoc().withStartupTimeout(240000).start();
        log(`neo4j test container started at: ${neo4jTestInstance.getBoltUri()}`)
        neo4jDriver = neo4j.driver(
            neo4jTestInstance.getBoltUri(),
            neo4j.auth.basic(neo4jTestInstance.getUsername(), neo4jTestInstance.getPassword())
        );
        log(`starting test app server`)
        await startTestAppServer(neo4jTestInstance.getBoltUri(), neo4jTestInstance.getUsername(), neo4jTestInstance.getPassword());
    });

    this.afterAll(async () => {
        log(`stopping test app server`)
        await stopAppServer();
        await neo4jDriver.close();
        log(`stopping neo4j test instance`)
        await neo4jTestInstance.stop();
    });

    this.beforeEach(async () => {
        const session = neo4jDriver.session();
        await session.run("MATCH (e) DETACH DELETE e");
        session.close();
    });

    this.afterEach(async () => {
        const session = neo4jDriver.session();
        await session.run("MATCH (e) DETACH DELETE e");
        session.close();
    });

    it('should mark a goal as complete after enough relevant events received', async () => {

        let userId = `test-user-${uuidv4()}`;

        let createdGoal = await addGoal({
            name: "Mobile Power User",
            description: "Use our fancy new mobile app to gain additional points!",
            points: 10,
            criteria: [
                {
                    description: "Log in at least 3 times on a mobile device",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "log-in",
                        platform: "mobile",
                    },
                    aggregation: {
                        type: "count",
                    },
                    threshold: 3
                }
            ]
        });

        let goalId = createdGoal.data.goalId;

        await sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress.data, {
            id: goalId,
            isComplete: false,
            name: "Mobile Power User",
            criteriaProgress: [{
                description: "Log in at least 3 times on a mobile device",
                progress: 1,
                threshold: 3,
            }]
        });

        await sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        await sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress2 = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress2.data, {
            id: goalId,
            name: "Mobile Power User",
            isComplete: true,
            completionTimestamp: 'a-valid-timestamp',
            criteriaProgress: [{
                description: "Log in at least 3 times on a mobile device",
                progress: 3,
                threshold: 3,
            }]

        });

    }).timeout(240000);

    it('should reject request to create a goal not adhering to goal schema', async () => {

        let userId = `test-user-${uuidv4()}`;

        const res = await addGoal({
            name: "Invalid Goal",
            description: "Use our fancy new mobile app to gain additional points!",
            points: 10,
            criteria: "this-is-not-valid-criteria"
        });
        assert.equal(res.status, 400);
        assert.equal(res.statusText, "Bad Request");

    }).timeout(240000);

    it('should mark a goal with multiple criteria as complete after enough relevant events received', async () => {

        let userId = `test-user-${uuidv4()}`;

        let createdGoal = await addGoal({
            name: "Repeat Customer",
            description: "Returning customers who make multiple purchases will receieve special perks and prioritized customer support.",
            points: 10,
            criteria: [
                {
                    description: "Log in at least 3 times.",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "userLoggedIn",
                    },
                    aggregation: {
                        type: "count"
                    },
                    threshold: 3
                },
                {
                    description: "Make at least 2 purchases.",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "itemPurchased",
                    },
                    aggregation: {
                        type: "count"
                    },
                    threshold: 2
                }
            ]
        });

        let goalId = createdGoal.data.goalId;

        await sendEvent({
            clientId: "client-app-1234",
            action: "userLoggedIn",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress.data, {
            id: goalId,
            isComplete: false,
            name: "Repeat Customer",
            criteriaProgress: [{
                description: "Log in at least 3 times.",
                progress: 1,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 3,
            }, {
                description: "Make at least 2 purchases.",
                progress: 0,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 2,
            }]

        });

        await sendEvent({
            clientId: "client-app-1234",
            action: "itemPurchased",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress2 = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress2.data, {
            id: goalId,
            isComplete: false,
            name: "Repeat Customer",
            criteriaProgress: [{
                description: "Log in at least 3 times.",
                progress: 1,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 3,
            }, {
                description: "Make at least 2 purchases.",
                progress: 1,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 2,
            }]

        });

        await sendEvent({
            clientId: "client-app-1234",
            action: "userLoggedIn",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        await sendEvent({
            clientId: "client-app-1234",
            action: "userLoggedIn",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress3 = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress3.data, {
            id: goalId,
            name: "Repeat Customer",
            isComplete: false,
            criteriaProgress: [{
                description: "Log in at least 3 times.",
                progress: 3,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 3,
            }, {
                description: "Make at least 2 purchases.",
                progress: 1,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 2,
            }]

        });

        await sendEvent({
            clientId: "client-app-1234",
            action: "itemPurchased",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress4 = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress4.data, {
            id: goalId,
            name: "Repeat Customer",
            isComplete: true,
            completionTimestamp: 'a-valid-timestamp',
            criteriaProgress: [{
                description: "Log in at least 3 times.",
                progress: 3,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 3,
            }, {
                description: "Make at least 2 purchases.",
                progress: 2,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 2,
            }]
        });

    }).timeout(240000);

    it('should return progress made towards multiple goals', async () => {

        let userId = `test-user-${uuidv4()}`;

        let createdGoal1 = await addGoal({
            name: "Returning Visitor",
            description: "Returning visitors who log in twice will receive this badge.",
            points: 10,
            criteria: [
                {
                    description: "Log in at least 2 times.",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "userLoggedIn",
                    },
                    aggregation: {
                        type: "count"
                    },
                    threshold: 2
                }
            ]
        });

        let goalId1 = createdGoal1.data.goalId;

        let createdGoal2 = await addGoal({
            name: "Salesman",
            description: "Users who sell an item will receive this badge.",
            points: 10,
            criteria: [
                {
                    description: "Sell at least one item.",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "itemSold",
                    },
                    aggregation: {
                        type: "count"
                    },
                    threshold: 1
                }
            ]
        });

        let goalId2 = createdGoal2.data.goalId;

        let createdGoal3 = await addGoal({
            name: "Impossible Goal",
            description: "This goal is not relevant to any current users.",
            points: 10,
            criteria: [
                {
                    description: "Do something impossible.",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        impossible: "attribute",
                    },
                    aggregation: {
                        type: "count"
                    },
                    threshold: 1
                }
            ]
        });

        let goalId3 = createdGoal3.data.goalId;

        await sendEvent({
            clientId: "client-app-1234",
            action: "userLoggedIn",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        await sendEvent({
            clientId: "client-app-1234",
            action: "itemSold",
            platform: "mobile",
            userId: userId,
            itemId: "123",
        }, true);

        let progress = await getProgress(userId);

        assertEqualEntityProgress(progress.data, [
            {
                id: goalId1,
                isComplete: false,
                name: "Returning Visitor",
                criteriaProgress: [
                    {
                        description: "Log in at least 2 times.",
                        progress: 1,
                        id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                        threshold: 2,
                    }
                ]
            },
            {
                id: goalId2,
                isComplete: true,
                completionTimestamp: "some-valid-timestamp",
                name: "Salesman",
                criteriaProgress: [
                    {
                        description: "Sell at least one item.",
                        progress: 1,
                        id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                        threshold: 1,
                    }
                ]
            },
            {
                id: goalId3,
                isComplete: false,
                name: "Impossible Goal",
                criteriaProgress: [
                    {
                        description: "Do something impossible.",
                        progress: 0,
                        id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                        threshold: 1,
                    }
                ]
            }]);

        let onlyCompletedGoalProgress = await getProgress(userId, undefined, true);
        assertEqualEntityProgress(onlyCompletedGoalProgress.data, [
            {
                id: goalId2,
                isComplete: true,
                completionTimestamp: "some-valid-timestamp",
                name: "Salesman",
                criteriaProgress: [
                    {
                        description: "Sell at least one item.",
                        progress: 1,
                        id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                        threshold: 1,
                    }
                ]
            }]);

    }).timeout(240000);

    // it('should let multiple entities benefit from the same event if multiple goals are applicable', async () => {

    //     let goal1 = await addGoal({
    //         name: "Mobile Power User",
    //         description: "Log in at least 3 times on a mobile device",
    //         criteria: [
    //             {
    //                 targetEntityIdField: "userId",
    //                 qualifyingEvent: {
    //                     action: "log-in",
    //                     platform: "mobile"
    //                 },
    //                 aggregation: {
    //                     type: "count",
    //                 },
    //                 threshold: 3
    //             }
    //         ]
    //     });

    //     let goal1Id = goal1.data.goalId;
    //     let goal1CriteriaIds = goal1.data.goal.criteriaIds;

    //     let goal2 = await addGoal({
    //         name: "The Popular Group",
    //         description: "Have members of your group log into at least 3 times",
    //         criteria: [
    //             {
    //                 targetEntityIdField: "groupId",
    //                 qualifyingEvent: {
    //                     action: "log-in",
    //                 },
    //                 aggregation: {
    //                     type: "count",
    //                 },
    //                 threshold: 3
    //             }
    //         ]
    //     });

    //     let goal2Id = goal2.data.goalId;
    //     let goal2CriteriaIds = goal2.data.goal.criteriaIds;

    //     await sendEvent({
    //         clientId: "client-app-1234",
    //         action: "log-in",
    //         platform: "mobile",
    //         userId: "john-doe-1234",
    //         groupId: "the-wildcats",
    //         foo: "bar"
    //     }, true);

    //     await sendEvent({
    //         clientId: "client-app-1234",
    //         action: "log-in",
    //         platform: "mobile",
    //         userId: "mike-smith-1234",
    //         groupId: "the-wildcats",
    //         foo: "bar"
    //     }, true);

    //     await sendEvent({
    //         clientId: "client-app-1234",
    //         action: "log-in",
    //         platform: "desktop",
    //         userId: "sally-craig-1234",
    //         groupId: "the-wildcats",
    //         foo: "bar"
    //     }, true);

    //     let johnProgress = await getProgress("userId", "john-doe-1234");
    //     assertEqualEntityProgress(johnProgress.data, {
    //         entityId: 'john-doe-1234',
    //         points: 0,
    //         goals: {
    //             [goal1Id]: {
    //                 criteriaIds: {
    //                     [goal1CriteriaIds[0]]: {
    //                         isComplete: false,
    //                         value: 1
    //                     }
    //                 },
    //                 isComplete: false
    //             }
    //         }
    //     });

    //     let mikeProgress = await getProgress("mike-smith-1234");
    //     assertEqualEntityProgress(mikeProgress.data, {
    //         entityId: 'mike-smith-1234',
    //         points: 0,
    //         goals: {
    //             [goal1Id]: {
    //                 criteriaIds: {
    //                     [goal1CriteriaIds[0]]: {
    //                         isComplete: false,
    //                         value: 1
    //                     }
    //                 },
    //                 isComplete: false
    //             }
    //         }
    //     });

    //     let sallyProgress = await getProgress("sally-craig-1234");
    //     // Sally has not made progress towards any goal so her overall progress is 404
    //     assert.deepStrictEqual(sallyProgress.status, 404);
    //     assert.deepStrictEqual(sallyProgress.data, {
    //         message: "no progress found for entity sally-craig-1234."
    //     });

    //     let groupProgress = await getProgress("the-wildcats");
    //     assertEqualEntityProgress(groupProgress.data, {
    //         entityId: 'the-wildcats',
    //         points: 0,
    //         goals: {
    //             [goal2Id]: {
    //                 criteriaIds: {
    //                     [goal2CriteriaIds[0]]: {
    //                         isComplete: true,
    //                         value: 3
    //                     }
    //                 },
    //                 isComplete: true
    //             }
    //         }
    //     });

    // }).timeout(240000);

    // it('should allow fetching of existing goals', async () => {

    //     let goal1 = await addGoal({
    //         name: "Mobile Power User",
    //         description: "Log in at least 3 times on a mobile device",
    //         criteria: [
    //             {
    //                 targetEntityIdField: "userId",
    //                 qualifyingEvent: {
    //                     action: "log-in",
    //                     platform: "mobile"
    //                 },
    //                 aggregation: {
    //                     type: "count",
    //                 },
    //                 threshold: 3
    //             }
    //         ]
    //     });

    //     let goal1Id = goal1.data.goalId;
    //     let goal1CriteriaIds = goal1.data.goal.criteriaIds;

    //     let goal2 = await addGoal({
    //         name: "The Popular Group",
    //         description: "Have members of your group log into at least 3 times",
    //         criteria: [
    //             {
    //                 targetEntityIdField: "groupId",
    //                 qualifyingEvent: {
    //                     action: "log-in",
    //                 },
    //                 aggregation: {
    //                     type: "count",
    //                 },
    //                 threshold: 3
    //             }
    //         ]
    //     });

    //     let goal2Id = goal2.data.goalId;
    //     let goal2CriteriaIds = goal2.data.goal.criteriaIds;

    //     let fetchedGoals = await getGoals();

    //     assert.deepStrictEqual(fetchedGoals.data, [
    //         {
    //             criteriaIds: goal1CriteriaIds,
    //             id: goal1Id,
    //             description: "Log in at least 3 times on a mobile device",
    //             name: 'Mobile Power User',
    //             state: "enabled"
    //         },
    //         {
    //             criteriaIds: goal2CriteriaIds,
    //             id: goal2Id,
    //             description: "Have members of your group log into at least 3 times",
    //             name: 'The Popular Group',
    //             state: "enabled"
    //         }
    //     ]);

    // }).timeout(240000);

    // it('should support sum aggregations on specific event fields', async () => {

    //     let createdGoal = await addGoal({
    //         name: "Frequent Flyer",
    //         description: "Spend at least 5 minutes in our app",
    //         criteria: [
    //             {
    //                 targetEntityIdField: "userId",
    //                 qualifyingEvent: {
    //                     action: "session-ended"
    //                 },
    //                 aggregation: {
    //                     type: "sum",
    //                     valueField: "sessionDurationInSeconds"
    //                 },
    //                 threshold: 300 // 300 seconds = 5 minutes
    //             }
    //         ]
    //     });

    //     let goalId = createdGoal.data.goalId;
    //     let criteriaIds = createdGoal.data.goal.criteriaIds;

    //     await sendEvent({
    //         clientId: "client-app-1234",
    //         action: "session-ended",
    //         userId: "john-doe-1234",
    //         sessionDurationInSeconds: 240, // Only 4 minutes, just shy of our goal
    //         foo: "bar"
    //     }, true);

    //     let progress = await getProgress("userId", "john-doe-1234");

    //     assertEqualEntityProgress(progress.data, {
    //         entityId: 'john-doe-1234',
    //         points: 0,
    //         goals: {
    //             [goalId]: {
    //                 criteriaIds: {
    //                     [criteriaIds[0]]: {
    //                         isComplete: false,
    //                         value: 240
    //                     }
    //                 },
    //                 isComplete: false
    //             }
    //         }
    //     });

    //     await sendEvent({
    //         clientId: "client-app-1234",
    //         action: "session-ended",
    //         userId: "john-doe-1234",
    //         sessionDurationInSeconds: 120, // Spent another 2 minutes in app
    //         foo: "bar"
    //     }, true);

    //     let progress2 = await getProgress("userId", "john-doe-1234");

    //     assertEqualEntityProgress(progress2.data, {
    //         entityId: 'john-doe-1234',
    //         points: 0,
    //         goals: {
    //             [goalId]: {
    //                 criteriaIds: {
    //                     [criteriaIds[0]]: {
    //                         isComplete: true,
    //                         value: 360
    //                     }
    //                 },
    //                 isComplete: true
    //             }
    //         }
    //     });

    // }).timeout(240000);

    // it('should support sum aggregations with predefined value', async () => {

    //     let createdGoal = await addGoal({
    //         name: "Social Butterfly",
    //         description: "Talk with your friends",
    //         criteria: [
    //             {
    //                 targetEntityIdField: "userId",
    //                 qualifyingEvent: {
    //                     action: "send-message"
    //                 },
    //                 aggregation: {
    //                     type: "sum",
    //                     value: 40
    //                 },
    //                 threshold: 100
    //             }
    //         ]
    //     });

    //     let goalId = createdGoal.data.goalId;
    //     let criteriaIds = createdGoal.data.goal.criteriaIds;

    //     await sendEvent({
    //         clientId: "client-app-1234",
    //         action: "send-message",
    //         userId: "john-doe-1234"
    //     }, true);

    //     let progress = await getProgress("userId", "john-doe-1234");

    //     assertEqualEntityProgress(progress.data, {
    //         entityId: 'john-doe-1234',
    //         points: 0,
    //         goals: {
    //             [goalId]: {
    //                 criteriaIds: {
    //                     [criteriaIds[0]]: {
    //                         isComplete: false,
    //                         value: 40
    //                     }
    //                 },
    //                 isComplete: false
    //             }
    //         }
    //     });

    //     await sendEvent({
    //         clientId: "client-app-1234",
    //         action: "send-message",
    //         userId: "john-doe-1234"
    //     }, true);

    //     await sendEvent({
    //         clientId: "client-app-1234",
    //         action: "send-message",
    //         userId: "john-doe-1234"
    //     }, true);

    //     let progress2 = await getProgress("userId", "john-doe-1234");

    //     assertEqualEntityProgress(progress2.data, {
    //         entityId: 'john-doe-1234',
    //         points: 0,
    //         goals: {
    //             [goalId]: {
    //                 criteriaIds: {
    //                     [criteriaIds[0]]: {
    //                         isComplete: true,
    //                         value: 120
    //                     }
    //                 },
    //                 isComplete: true
    //             }
    //         }
    //     });

    // }).timeout(240000);

    // it('should require all criteria to finish before marking goal as complete', async () => {

    //     let createdGoal = await addGoal({
    //         name: "Power User",
    //         description: "Log in 2 times AND spend at least 5 minutes in the app",
    //         criteria: [
    //             {
    //                 targetEntityIdField: "userId",
    //                 qualifyingEvent: {
    //                     action: "log-in",
    //                 },
    //                 aggregation: {
    //                     type: "count",
    //                 },
    //                 threshold: 2
    //             },
    //             {
    //                 targetEntityIdField: "userId",
    //                 qualifyingEvent: {
    //                     action: "session-ended"
    //                 },
    //                 aggregation: {
    //                     type: "sum",
    //                     valueField: "sessionDurationInSeconds"
    //                 },
    //                 threshold: 300 // 300 seconds = 5 minutes
    //             }
    //         ]
    //     });

    //     let goalId = createdGoal.data.goalId;
    //     let criteriaIds = createdGoal.data.goal.criteriaIds;

    //     // User logs in
    //     await sendEvent({
    //         action: "log-in",
    //         userId: "john-doe-1234",
    //     }, true);

    //     // User session ends 10 minutes later
    //     await sendEvent({
    //         action: "session-ended",
    //         userId: "john-doe-1234",
    //         sessionDurationInSeconds: 600, // 10 minutes, well past requirements
    //     }, true);

    //     let progress1 = await getProgress("userId", "john-doe-1234");

    //     assertEqualEntityProgress(progress1.data, {
    //         entityId: 'john-doe-1234',
    //         points: 0,
    //         goals: {
    //             [goalId]: {
    //                 criteriaIds: {
    //                     [criteriaIds[0]]: {
    //                         isComplete: false,
    //                         value: 1
    //                     },
    //                     [criteriaIds[1]]: {
    //                         isComplete: true,
    //                         value: 600
    //                     }
    //                 },
    //                 isComplete: false
    //             }
    //         }
    //     });

    //     // User logs in again
    //     await sendEvent({
    //         action: "log-in",
    //         userId: "john-doe-1234",
    //     }, true);

    //     let progress2 = await getProgress("userId", "john-doe-1234");

    //     assertEqualEntityProgress(progress2.data, {
    //         entityId: 'john-doe-1234',
    //         points: 0,
    //         goals: {
    //             [goalId]: {
    //                 criteriaIds: {
    //                     [criteriaIds[0]]: {
    //                         isComplete: true,
    //                         value: 2
    //                     },
    //                     [criteriaIds[1]]: {
    //                         isComplete: true,
    //                         value: 600
    //                     }
    //                 },
    //                 isComplete: true
    //             }
    //         }
    //     });

    // }).timeout(240000);

});