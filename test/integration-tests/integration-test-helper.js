const { MongoMemoryServer } = require('mongodb-memory-server');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

const ALL_MONGO_INSTANCES = {};

async function issueHttpGet(url) {
    return new Promise((resolve) => {
        console.log(`${new Date()}::: Request issued to ${url}.`);

        http.get(url, (res) => {
            console.log(`${new Date()}::: Response received from ${url}.`);
            resolve(res);
        });
    });
};

async function startAppServer(mongoConnString) {

    const appServerPort = 10393;
    process.env.PORT = appServerPort;
    process.env.DB_CONN_STRING = mongoConnString;
    let appServer = require('../../src/index.js');

    let maxAttempts = 5;
    let attempt = 0;
    let timeBetweenAttemptsMs = 1000;
    return new Promise((resolve, reject) => {
        let checkServerIntervalId = setInterval(async () => {
            attempt++;
            console.log(`Attempt #${attempt} to see if app server started.`);
            let healthRequest = await issueHttpGet(`http://localhost:${appServerPort}/health`);
            if (healthRequest.statusCode === 200) {
                console.log(`App server has started. Proceeding.`);
                clearInterval(checkServerIntervalId);
                resolve(appServer);
            } else if (attempt > maxAttempts) {
                console.log(`Exceeded maximum attempts (${maxAttempts}). Exiting.`);
                clearInterval(checkServerIntervalId);
                reject();
            } else {
                console.log(`App server not ready. Will try again in ${timeBetweenAttemptsMs} ms.`);
            }
        }, timeBetweenAttemptsMs);
    });
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
    issueHttpGet
};