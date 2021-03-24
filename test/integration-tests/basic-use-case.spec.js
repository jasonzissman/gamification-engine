const assert = require('assert');
const integrationTestHelper = require('./integration-test-helper');
const goalTestHelper = require('./goal-test-helper');
const eventTestHelper = require('./event-test-helper');
const entityProgressTestHelper = require('./entity-progress-test-helper');

describe('Basic Use Cases', () => {

    let mongoInstance;
    let appServer;

    beforeEach(async () => {
        mongoInstance = await integrationTestHelper.startInMemoryMongo();
        appServer = await integrationTestHelper.startAppServer(mongoInstance.uri);
    });

    afterEach(async () => {

        if (appServer) {
            appServer.shutDown();
        }

        if (mongoInstance && mongoInstance.mongoId) {
            await integrationTestHelper.stopInMemoryMongo(mongoInstance.mongoId);
        }

    });

    it('should allow clients to define goal and track progress towards goal', async () => {

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

    }).timeout(10000);
});