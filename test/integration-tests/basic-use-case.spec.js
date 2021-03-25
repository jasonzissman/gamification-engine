const assert = require('assert');
const integrationTestHelper = require('./integration-test-helper');
const goalTestHelper = require('./goal-test-helper');
const eventTestHelper = require('./event-test-helper');
const entityProgressTestHelper = require('./entity-progress-test-helper');

describe('Basic Use Cases', function () {

    // The Mocha this.timeout() call only works inside of 'function'
    // declarations, not inside of arrow notation () => {}
    this.timeout(15000);

    let mongoInstance;

    beforeEach(async () => {
        mongoInstance = await integrationTestHelper.startInMemoryMongo();
        await integrationTestHelper.startAppServer(mongoInstance.uri);
    });

    afterEach(async () => {

        await integrationTestHelper.shutDownAppServer();

        if (mongoInstance && mongoInstance.mongoId) {
            await integrationTestHelper.stopInMemoryMongo(mongoInstance.mongoId);
        }
    });

    it('should mark a goal as complete after enough relevant events received', async () => {

        let createdGoal = await goalTestHelper.addGoal({
            name: "Mobile Power User",
            description: "Log in at least 3 times on a mobile device",
            targetEntityIdField: "userId",
            criteria: [
                {
                    qualifyingEvent: {
                        action: "log-in",
                        platform: "mobile"
                    },
                    aggregation: {
                        type: "count",
                    },
                    threshold: 3
                }
            ]
        });

        let goalId = createdGoal.data.goal.id;
        let criteriaIds = createdGoal.data.goal.criteriaIds;

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: "john-doe-1234",
            foo: "bar"
        });

        let progress = await entityProgressTestHelper.getProgress("john-doe-1234");

        assert.deepStrictEqual(progress.data, {
            entityId: 'john-doe-1234',
            goals: {
                [goalId]: {
                    criteriaIds: {
                        [criteriaIds[0]]: {
                            isComplete: false,
                            value: 1
                        }
                    },
                    isComplete: false
                }
            }
        });

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: "john-doe-1234",
            foo: "bar"
        });

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: "john-doe-1234",
            foo: "bar"
        });

        let progress2 = await entityProgressTestHelper.getProgress("john-doe-1234");

        assert.deepStrictEqual(progress2.data, {
            entityId: 'john-doe-1234',
            goals: {
                [goalId]: {
                    criteriaIds: {
                        [criteriaIds[0]]: {
                            isComplete: true,
                            value: 3
                        }
                    },
                    isComplete: true
                }
            }
        });

    }).timeout(15000);

    it('should let multiple entities benefit from the same event if multiple goals are applicable', async () => {

        let goal1 = await goalTestHelper.addGoal({
            name: "Mobile Power User",
            description: "Log in at least 3 times on a mobile device",
            targetEntityIdField: "userId",
            criteria: [
                {
                    qualifyingEvent: {
                        action: "log-in",
                        platform: "mobile"
                    },
                    aggregation: {
                        type: "count",
                    },
                    threshold: 3
                }
            ]
        });

        let goal1Id = goal1.data.goal.id;
        let goal1CriteriaIds = goal1.data.goal.criteriaIds;

        let goal2 = await goalTestHelper.addGoal({
            name: "The Popular Group",
            description: "Have members of your group log into at least 3 times",
            targetEntityIdField: "groupId",
            criteria: [
                {
                    qualifyingEvent: {
                        action: "log-in",
                    },
                    aggregation: {
                        type: "count",
                    },
                    threshold: 3
                }
            ]
        });

        let goal2Id = goal2.data.goal.id;
        let goal2CriteriaIds = goal2.data.goal.criteriaIds;

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: "john-doe-1234",
            "groupId": "the-wildcats",
            foo: "bar"
        });

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: "mike-smith-1234",
            "groupId": "the-wildcats",
            foo: "bar"
        });

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "desktop",
            userId: "sally-craig-1234",
            "groupId": "the-wildcats",
            foo: "bar"
        });

        let johnProgress = await entityProgressTestHelper.getProgress("john-doe-1234");
        assert.deepStrictEqual(johnProgress.data, {
            entityId: 'john-doe-1234',
            goals: {
                [goal1Id]: {
                    criteriaIds: {
                        [goal1CriteriaIds[0]]: {
                            isComplete: false,
                            value: 1
                        }
                    },
                    isComplete: false
                }
            }
        });

        let mikeProgress = await entityProgressTestHelper.getProgress("mike-smith-1234");
        assert.deepStrictEqual(mikeProgress.data, {
            entityId: 'mike-smith-1234',
            goals: {
                [goal1Id]: {
                    criteriaIds: {
                        [goal1CriteriaIds[0]]: {
                            isComplete: false,
                            value: 1
                        }
                    },
                    isComplete: false
                }
            }
        });

        let sallyProgress = await entityProgressTestHelper.getProgress("sally-craig-1234");
        // Sally has not made progress towards any goal so her overall progress is 404
        assert.deepStrictEqual(sallyProgress.status, 404);
        assert.deepStrictEqual(sallyProgress.data, {
            message: "no progress found for entity sally-craig-1234."
        });

        let groupProgress = await entityProgressTestHelper.getProgress("the-wildcats");
        assert.deepStrictEqual(groupProgress.data, {
            entityId: 'the-wildcats',
            goals: {
                [goal2Id]: {
                    criteriaIds: {
                        [goal2CriteriaIds[0]]: {
                            isComplete: true,
                            value: 3
                        }
                    },
                    isComplete: true
                }
            }
        });

    }).timeout(15000);

    it('should allow fetching of existing goals', async () => {

        let goal1 = await goalTestHelper.addGoal({
            name: "Mobile Power User",
            description: "Log in at least 3 times on a mobile device",
            targetEntityIdField: "userId",
            criteria: [
                {
                    qualifyingEvent: {
                        action: "log-in",
                        platform: "mobile"
                    },
                    aggregation: {
                        type: "count",
                    },
                    threshold: 3
                }
            ]
        });

        let goal1Id = goal1.data.goal.id;
        let goal1CriteriaIds = goal1.data.goal.criteriaIds;

        let goal2 = await goalTestHelper.addGoal({
            name: "The Popular Group",
            description: "Have members of your group log into at least 3 times",
            targetEntityIdField: "groupId",
            criteria: [
                {
                    qualifyingEvent: {
                        action: "log-in",
                    },
                    aggregation: {
                        type: "count",
                    },
                    threshold: 3
                }
            ]
        });

        let goal2Id = goal2.data.goal.id;
        let goal2CriteriaIds = goal2.data.goal.criteriaIds;

        let fetchedGoals = await goalTestHelper.getGoals();

        assert.deepStrictEqual(fetchedGoals.data, [
            {
                criteriaIds: goal1CriteriaIds,
                id: goal1Id,
                description: "Log in at least 3 times on a mobile device",
                name: 'Mobile Power User',
                targetEntityIdField: 'userId'
            },
            {
                criteriaIds: goal2CriteriaIds,
                id: goal2Id,
                description: "Have members of your group log into at least 3 times",
                name: 'The Popular Group',
                targetEntityIdField: 'groupId'
            }
        ]);

    }).timeout(15000);

    it('should support count aggregations on specific event fields', async () => {

        let createdGoal = await goalTestHelper.addGoal({
            name: "Frequent Flyer",
            description: "Spend at least 5 minutes in our app",
            targetEntityIdField: "userId",
            criteria: [
                {
                    qualifyingEvent: {
                        action: "session-ended"
                    },
                    aggregation: {
                        type: "sum",
                        valueField: "sessionDurationInSeconds"
                    },
                    threshold: 300 // 300 seconds = 5 minutes
                }
            ]
        });

        let goalId = createdGoal.data.goal.id;
        let criteriaIds = createdGoal.data.goal.criteriaIds;

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "session-ended",
            userId: "john-doe-1234",
            sessionDurationInSeconds: 240, // Only 4 minutes, just shy of our goal
            foo: "bar"
        });

        let progress = await entityProgressTestHelper.getProgress("john-doe-1234");

        assert.deepStrictEqual(progress.data, {
            entityId: 'john-doe-1234',
            goals: {
                [goalId]: {
                    criteriaIds: {
                        [criteriaIds[0]]: {
                            isComplete: false,
                            value: 240
                        }
                    },
                    isComplete: false
                }
            }
        });

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "session-ended",
            userId: "john-doe-1234",
            sessionDurationInSeconds: 120, // Spent another 2 minutes in app
            foo: "bar"
        });

        let progress2 = await entityProgressTestHelper.getProgress("john-doe-1234");

        assert.deepStrictEqual(progress2.data, {
            entityId: 'john-doe-1234',
            goals: {
                [goalId]: {
                    criteriaIds: {
                        [criteriaIds[0]]: {
                            isComplete: true,
                            value: 360
                        }
                    },
                    isComplete: true
                }
            }
        });

    }).timeout(15000);

    it('should support count aggregations with predefined value', async () => {

        let createdGoal = await goalTestHelper.addGoal({
            name: "Social Butterfly",
            description: "Talk with your friends",
            targetEntityIdField: "userId",
            criteria: [
                {
                    qualifyingEvent: {
                        action: "send-message"
                    },
                    aggregation: {
                        type: "sum",
                        value: 40
                    },
                    threshold: 100
                }
            ]
        });

        let goalId = createdGoal.data.goal.id;
        let criteriaIds = createdGoal.data.goal.criteriaIds;

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "send-message",
            userId: "john-doe-1234"
        });

        let progress = await entityProgressTestHelper.getProgress("john-doe-1234");

        assert.deepStrictEqual(progress.data, {
            entityId: 'john-doe-1234',
            goals: {
                [goalId]: {
                    criteriaIds: {
                        [criteriaIds[0]]: {
                            isComplete: false,
                            value: 40
                        }
                    },
                    isComplete: false
                }
            }
        });

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "send-message",
            userId: "john-doe-1234"
        });

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "send-message",
            userId: "john-doe-1234"
        });

        let progress2 = await entityProgressTestHelper.getProgress("john-doe-1234");

        assert.deepStrictEqual(progress2.data, {
            entityId: 'john-doe-1234',
            goals: {
                [goalId]: {
                    criteriaIds: {
                        [criteriaIds[0]]: {
                            isComplete: true,
                            value: 120
                        }
                    },
                    isComplete: true
                }
            }
        });

    }).timeout(15000);

    it('should require all criteria to finish before marking goal as complete', async () => {

        let createdGoal = await goalTestHelper.addGoal({
            name: "Power User",
            description: "Log in 2 times AND spend at least 5 minutes in the app",
            targetEntityIdField: "userId",
            criteria: [
                {
                    qualifyingEvent: {
                        action: "log-in",
                    },
                    aggregation: {
                        type: "count",
                    },
                    threshold: 2
                },
                {
                    qualifyingEvent: {
                        action: "session-ended"
                    },
                    aggregation: {
                        type: "sum",
                        valueField: "sessionDurationInSeconds"
                    },
                    threshold: 300 // 300 seconds = 5 minutes
                }
            ]
        });

        let goalId = createdGoal.data.goal.id;
        let criteriaIds = createdGoal.data.goal.criteriaIds;

        // User logs in
        await eventTestHelper.sendEvent({
            action: "log-in",
            userId: "john-doe-1234",
        });

        // Some time elapses
        await new Promise(r => setTimeout(r, 500));

        // User session ends 10 minutes later
        await eventTestHelper.sendEvent({
            action: "session-ended",
            userId: "john-doe-1234",
            sessionDurationInSeconds: 600, // 10 minutes, well past requirements
        });

        let progress1 = await entityProgressTestHelper.getProgress("john-doe-1234");

        assert.deepStrictEqual(progress1.data, {
            entityId: 'john-doe-1234',
            goals: {
                [goalId]: {
                    criteriaIds: {
                        [criteriaIds[0]]: {
                            isComplete: false,
                            value: 1
                        },
                        [criteriaIds[1]]: {
                            isComplete: true,
                            value: 600
                        }
                    },
                    isComplete: false
                }
            }
        });

        // User logs in again
        await eventTestHelper.sendEvent({
            action: "log-in",
            userId: "john-doe-1234",
        });

        let progress2 = await entityProgressTestHelper.getProgress("john-doe-1234");

        assert.deepStrictEqual(progress2.data, {
            entityId: 'john-doe-1234',
            goals: {
                [goalId]: {
                    criteriaIds: {
                        [criteriaIds[0]]: {
                            isComplete: true,
                            value: 2
                        },
                        [criteriaIds[1]]: {
                            isComplete: true,
                            value: 600
                        }
                    },
                    isComplete: true
                }
            }
        });

    }).timeout(15000);
});