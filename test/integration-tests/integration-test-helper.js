import axios  from 'axios';
import assert from 'assert';
import { log } from '../../src/utility/logger.js';

import { startServer, stopServer } from '../../src/index.js';

const TEST_APP_SERVER_HOST = "localhost";
const TEST_APP_SERVER_PORT = 10393;
const TEST_APP_BASE_URL = `http://${TEST_APP_SERVER_HOST}:${TEST_APP_SERVER_PORT}`;

let APP_SERVER;

async function issueHttpGet(pathAndParams) {
    const url = `${TEST_APP_BASE_URL}/${pathAndParams}`;
    log(`GET issued to ${url}.`);
    let response = await axios.get(url, { validateStatus: false });
    log(`GET response received from ${url}.`);
    return response;
};

async function issueHttpPost(pathAndParams, body, headers) {
    const url = `${TEST_APP_BASE_URL}/${pathAndParams}`;
    log(`POST issued to ${url}.`);
    let response = await axios.post(url, body, { headers: headers, validateStatus: false });
    log(`POST response received from ${url}.`);
    return response;
};

async function addGoal(goal) {
    let pathAndParams = "goal";
    const headers = { "Content-Type": "application/json" };
    return issueHttpPost(pathAndParams, goal, headers);
}

async function startTestAppServer(neo4jBoltUri, neo4jUser, neo4jPassword) {

    APP_SERVER = await startServer(TEST_APP_SERVER_PORT, neo4jBoltUri, neo4jUser, neo4jPassword);

    let maxAttempts = 5;
    let attempt = 0;
    let timeBetweenAttemptsMs = 2000;
    return new Promise((resolve, reject) => {
        let checkServerIntervalId = setInterval(async () => {
            attempt++;
            log(`Attempt #${attempt} to see if app server started.`);
            let healthRequest = await issueHttpGet(`health`);
            if (healthRequest.status === 200) {
                log(`App server has started. Proceeding.`);
                clearInterval(checkServerIntervalId);
                resolve(process.env.PORT);
            } else if (attempt > maxAttempts) {
                log(`Exceeded maximum attempts (${maxAttempts}). Exiting.`);
                clearInterval(checkServerIntervalId);
                reject();
            } else {
                log(`App server not ready. Will try again in ${timeBetweenAttemptsMs} ms.`);
            }
        }, timeBetweenAttemptsMs);
    });
}

async function stopAppServer() {
    await stopServer(APP_SERVER);
    APP_SERVER = undefined;
}

function assertEqualEntityProgress(actualProgress, expectedProgress) {
    let modifiedActualProgress = JSON.parse(JSON.stringify(actualProgress));
    let modifiedExpectedProgress = JSON.parse(JSON.stringify(expectedProgress));
    normalizeGeneratedValues(modifiedActualProgress);
    normalizeGeneratedValues(modifiedExpectedProgress);
    assert.deepStrictEqual(modifiedActualProgress, modifiedExpectedProgress);
};

function normalizeGeneratedValues(progress) {
    for (let key in progress) {
        if (key === 'id') {
            delete progress[key];
        } else if (key === 'completionTimestamp') {
            if (progress['completionTimestamp'] && progress['completionTimestamp'] !== null) {
                progress['completionTimestamp'] = 'a-valid-timestamp'
            }


        }  else if (typeof progress[key] === 'object') {
            normalizeGeneratedValues(progress[key]);
        }

        if (key === "criteria") {
            progress[key].sort((c1,c2) => {
                return c1.description.localeCompare(c2.description)}
            );
        }
    }
}

export {
    startTestAppServer,
    stopAppServer,
    issueHttpGet,
    issueHttpPost,
    addGoal,
    assertEqualEntityProgress
};