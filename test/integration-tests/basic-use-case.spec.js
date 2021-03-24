const assert = require('assert');
const integrationTestHelper = require('./integration-test-helper');
const goalTestHelper = require('./goal-test-helper');
const eventTestHelper = require('./event-test-helper');
const entityProgressTestHelper = require('./entity-progress-test-helper');

describe('Basic Use Cases', () => {

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
            "name": "Mobile Power User",
            "desc": "Log in at least 3 times on a mobile device",
            "targetEntityId": "userId",
            "criteria": [
                {
                    "qualifyingEvent": {
                        "action": "log-in",
                        "platform": "mobile"
                    },
                    "aggregation": "count",
                    "aggregationValue": 1,
                    "threshold": 3
                }
            ]
        });

        let goalId = createdGoal.data.goal.id;
        let criteriaIds = createdGoal.data.goal.criteriaIds;

        await eventTestHelper.sendEvent({
            "clientId": "client-app-1234",
            "action": "log-in",
            "platform": "mobile",
            "userId": "john-doe-1234",
            "foo": "bar"
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
            "clientId": "client-app-1234",
            "action": "log-in",
            "platform": "mobile",
            "userId": "john-doe-1234",
            "foo": "bar"
        });

        await eventTestHelper.sendEvent({
            "clientId": "client-app-1234",
            "action": "log-in",
            "platform": "mobile",
            "userId": "john-doe-1234",
            "foo": "bar"
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

    }).timeout(10000);
});