const assert = require('assert');
const integrationTestHelper = require('./integration-test-helper');
const goalTestHelper = require('./goal-test-helper');
const eventTestHelper = require('./event-test-helper');
const entityProgressTestHelper = require('./entity-progress-test-helper');

describe('Enabling and Disabling Goals', function () {

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

    it('should allow user to disable goal', async () => {

        let createdGoal = await goalTestHelper.addGoal({
            name: "Mobile Power User",
            description: "Log in at least 3 times on a mobile device",
            targetEntityIdField: "userId",
            points: 10,
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
        }, true);

        let progress = await entityProgressTestHelper.getProgress("john-doe-1234");

        integrationTestHelper.assertEqualProgress(progress.data, {
            entityId: 'john-doe-1234',
            points: 0,
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

        // Disable goal
        await goalTestHelper.setGoalState(goalId, "disabled");

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: "john-doe-1234",
            foo: "bar"
        }, true);

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: "john-doe-1234",
            foo: "bar"
        }, true);

        let progress2 = await entityProgressTestHelper.getProgress("john-doe-1234");

        // Goal was disabled so no progress made
        integrationTestHelper.assertEqualProgress(progress2.data, {
            entityId: 'john-doe-1234',
            points: 0,
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

        // Enable goal
        await goalTestHelper.setGoalState(goalId, "enabled");

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: "john-doe-1234",
            foo: "bar"
        }, true);

        await eventTestHelper.sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: "john-doe-1234",
            foo: "bar"
        }, true);

        let progress3 = await entityProgressTestHelper.getProgress("john-doe-1234");

        integrationTestHelper.assertEqualProgress(progress3.data, {
            entityId: 'john-doe-1234',
            points: 10,
            goals: {
                [goalId]: {
                    criteriaIds: {
                        [criteriaIds[0]]: {
                            isComplete: true,
                            value: 3
                        }
                    },
                    isComplete: true,
                    pointsAwarded: 10
                }
            }
        });

        // Assert valid completion dates added
        let goalCompletionDate = Number(progress3.data.goals[goalId].completionDate);
        let criteriaCompletionDate = Number(progress3.data.goals[goalId].criteriaIds[criteriaIds[0]].completionDate);
        assert.strictEqual(isNaN(goalCompletionDate), false);
        assert.strictEqual(goalCompletionDate > 0, true);
        assert.strictEqual(goalCompletionDate < new Date().getTime(), true);
        assert.strictEqual(isNaN(criteriaCompletionDate), false);
        assert.strictEqual(criteriaCompletionDate > 0, true);
        assert.strictEqual(criteriaCompletionDate < new Date().getTime(), true);

    }).timeout(15000);
});

