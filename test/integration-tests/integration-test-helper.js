const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const assert = require('assert');
const logger = require('../../src/utility/logger');

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

async function startAppServer(dbHost, dbPort, dbUser, dbPassword) {

    process.env.PORT = TEST_APP_SERVER_PORT;
    process.env.NEO4J_HOST = dbHost;
    process.env.NEO4J_PORT = dbPort;
    process.env.NEO4J_USER = dbUser;
    process.env.NEO4J_PW = dbPassword;

    APP_SERVER = require('../../src/index.js');

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
    normalizeGeneratedValues(modifiedActualProgress);
    normalizeGeneratedValues(modifiedExpectedProgress);
    assert.deepStrictEqual(modifiedActualProgress, modifiedExpectedProgress);
};

function normalizeGeneratedValues(progress) {
    for (key in progress) {
        if (key === 'id') {
            delete progress[key];
        } else if (key === 'completionTimestamp') {
            if (progress['completionTimestamp'] && progress['completionTimestamp'] !== null) {
                progress['completionTimestamp'] = 'a-valid-timestamp'
            }
        } else if (typeof progress[key] === 'object') {
            normalizeGeneratedValues(progress[key]);
        }
    }
}


module.exports = {
    startAppServer,
    issueHttpGet,
    issueHttpPost,
    addGoal,
    assertEqualEntityProgress
};