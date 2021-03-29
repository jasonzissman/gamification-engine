const { MongoMemoryServer } = require('mongodb-memory-server');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const assert = require('assert');
const logger = require('../../src/utility/logger');

const ALL_MONGO_INSTANCES = {};
let APP_SERVER;

const TEST_APP_SERVER_HOST = "localhost";
const TEST_APP_SERVER_PORT = 10393;
const TEST_APP_BASE_URL = `http://${TEST_APP_SERVER_HOST}:${TEST_APP_SERVER_PORT}`;

async function issueHttpGet(pathAndParams) {
    const url = `${TEST_APP_BASE_URL}/${pathAndParams}`;
    logger.info(`GET issued to ${url}.`);
    let response = await axios.get(url, {validateStatus: false});
    logger.info(`GET response received from ${url}.`);
    return response;
};

async function issueHttpPost(pathAndParams, body, headers) {
    const url = `${TEST_APP_BASE_URL}/${pathAndParams}`;
    logger.info(`POST issued to ${url}.`);
    let response = await axios.post(url, body, {headers: headers, validateStatus: false});
    logger.info(`POST response received from ${url}.`);
    return response;
};

async function addGoal(goal) {
    let pathAndParams = "goal";
    const headers = {"Content-Type": "application/json"};
    return issueHttpPost(pathAndParams, goal, headers);
}

async function shutDownAppServer() {
    if (APP_SERVER) {
        await APP_SERVER.shutDown();
    }
}

async function startAppServer(mongoConnString) {

    process.env.PORT = TEST_APP_SERVER_PORT;
    process.env.DB_CONN_STRING = mongoConnString;
    APP_SERVER = require('../../src/index.js');
    await APP_SERVER.start();

    let maxAttempts = 5;
    let attempt = 0;
    let timeBetweenAttemptsMs = 2000;
    return new Promise((resolve, reject) => {
        let checkServerIntervalId = setInterval(async () => {
            attempt++;
            logger.info(`Attempt #${attempt} to see if app server started.`);
            let healthRequest = await issueHttpGet(`health`);
            if (healthRequest.status === 200) {
                logger.info(`App server has started. Proceeding.`);
                clearInterval(checkServerIntervalId);
                resolve(process.env.PORT);
            } else if (attempt > maxAttempts) {
                logger.info(`Exceeded maximum attempts (${maxAttempts}). Exiting.`);
                clearInterval(checkServerIntervalId);
                reject();
            } else {
                logger.info(`App server not ready. Will try again in ${timeBetweenAttemptsMs} ms.`);
            }
        }, timeBetweenAttemptsMs);
    });
}

function assertEqualEntityProgress(actualProgress, expectedProgress) {
    let modifiedActualProgress = JSON.parse(JSON.stringify(actualProgress));
    let modifiedExpectedProgress = JSON.parse(JSON.stringify(expectedProgress));
    removeTimestampData(modifiedActualProgress);
    removeTimestampData(modifiedExpectedProgress);
    assert.deepStrictEqual(modifiedActualProgress, modifiedExpectedProgress);
};

function removeTimestampData(progress) {
    for (key in progress) {
        if (key === 'completionDate') {
            delete progress[key];
        } else if (typeof progress[key] === 'object') {
            removeTimestampData(progress[key]);
        }
    }
}
async function startInMemoryMongo() {
    const mongoId = uuidv4();
    const mongoInstance = new MongoMemoryServer();
    ALL_MONGO_INSTANCES[mongoId] = mongoInstance;

    const uri = await mongoInstance.getUri();
    const port = await mongoInstance.getPort();
    const dbPath = await mongoInstance.getDbPath();
    const dbName = await mongoInstance.getDbName();

    return { mongoId, uri, port, dbPath, dbName };
}

async function stopInMemoryMongo(mongoId) {
    return ALL_MONGO_INSTANCES[mongoId].stop();
}

async function stopAllInMemoryMongoInstances() {
    const shutdownRequests = [];
    for (mongoId in ALL_MONGO_INSTANCES) {
        shutdownRequests.push(ALL_MONGO_INSTANCES[mongoId].stop());
    }
    return Promise.all(shutdownRequests);
}

module.exports = {
    startInMemoryMongo,
    stopInMemoryMongo,
    stopAllInMemoryMongoInstances,
    startAppServer,
    shutDownAppServer,
    issueHttpGet,
    issueHttpPost,
    addGoal,
    assertEqualEntityProgress
};