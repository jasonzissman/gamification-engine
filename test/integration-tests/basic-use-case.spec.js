const assert = require('assert');
const integrationTestHelper = require('./integration-test-helper');

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

        

    }).timeout(10000);
});