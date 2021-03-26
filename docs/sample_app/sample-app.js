const express = require('express');
const axios = require('axios');
const integrationTestHelper = require('../../test/integration-tests/integration-test-helper');

let gamificationServerHost = "http://localhost:";

async function start() {
    await startGamificationEngine();
    await addInitialGoals();
    await startExpressApp();
}

function startExpressApp() {
    const app = express();

    app.use('/static', express.static('static'))
    app.use(express.json());

    const port = 31854;

    app.get("/log-in", async (request, response) => {
        // your application's login code here...
        await reportLoginEvent("john-doe-1234");
        response.status(200).send({ message: "successfully logged in" });
    });

    app.get("/log-out", async (request, response) => {
        // your application's logout code here...
        await reportLogoutEvent("john-doe-1234");
        response.status(200).send({ message: "successfully logged out" });
    });

    app.get("/view-page/:pageName", async (request, response) => {
        // your application's page rendering code here...
        await reportPageViewEvent("john-doe-1234", request.params.pageName);
        response.status(200).send({ message: `successfully viewed page ${request.params.pageName}` });
    });

    app.get("/perform-activity", async (request, response) => {
        // your application's perform-activity code here...
        await reportActivityPerformedEvent("john-doe-1234", request.query.timePerformingActivity);
        response.status(200).send({ message: `successfully performed activity for ${request.query.timePerformingActivity} seconds.` });
    });

    app.get("/goal-progress", async (request, response) => {
        let gamificationEngineGoalResponse = await issueHttpGet(gamificationServerHost + "/goal");
        let gamificationEngineProgressResponse = await issueHttpGet(gamificationServerHost + "/entity/john-doe-1234");
        response.status(200).send({
            message: {
                goals: gamificationEngineGoalResponse.data,
                progress: gamificationEngineProgressResponse.data
            }
        });
    });

    app.listen(port, (err) => {
        if (err) {
            console.log(err);
        }

        console.log(`Sample app listening on ${port}.`);
    });
}

async function issueHttpGet(url) {
    return axios.get(url, { validateStatus: false });
};

async function issueHttpPost(url, body) {
    return axios.post(url, body, { headers: { "Content-Type": "application/json" }, validateStatus: false });
};

async function reportActivityPerformedEvent(userId, timeDoingActivity) {
    let eventPayload = {
        action: "perform-activity",
        timeDoingActivity: timeDoingActivity,
        userId: userId
    };
    await issueHttpPost(gamificationServerHost + "/event", eventPayload);
}

async function reportPageViewEvent(userId, page) {
    let eventPayload = {
        action: "view-page",
        page: page,
        userId: userId
    };
    await issueHttpPost(gamificationServerHost + "/event", eventPayload);
}

async function reportLogoutEvent(userId) {
    let eventPayload = {
        action: "log-out",
        userId: userId
    };
    await issueHttpPost(gamificationServerHost + "/event", eventPayload);
}

async function reportLoginEvent(userId) {
    let eventPayload = {
        action: "log-in",
        userId: userId
    };
    await issueHttpPost(gamificationServerHost + "/event", eventPayload);
}

async function startGamificationEngine() {
    let inMemoryMongo = await integrationTestHelper.startInMemoryMongo();
    let gamificationEnginePort = await integrationTestHelper.startAppServer(inMemoryMongo.uri);
    gamificationServerHost = gamificationServerHost + gamificationEnginePort;
}

async function addInitialGoals() {
    let url = gamificationServerHost + "/goal";

    // Create power-user goal
    issueHttpPost(url, {
        name: "Power User",
        description: "Log in at least 3 times",
        targetEntityIdField: "userId",
        points: 10,
        criteria: [
            {
                qualifyingEvent: {
                    action: "log-in"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 3
            }
        ]
    });

    // Create been-doing-this-forever goal
    issueHttpPost(url, {
        name: "Been Doing This Forever",
        description: "Perform an activity for 100 seconds",
        targetEntityIdField: "userId",
        points: 100,
        criteria: [
            {
                qualifyingEvent: {
                    action: "perform-activity"
                },
                aggregation: {
                    type: "sum",
                    valueField: "timeDoingActivity"
                },
                threshold: 100
            }
        ]
    });

    // Create newcomer tutorial
    issueHttpPost(url, {
        name: "Newcomer Tutorial",
        description: "Log in, view all pages, and log out",
        targetEntityIdField: "userId",
        points: 50,
        criteria: [
            {
                qualifyingEvent: {
                    action: "log-in"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 1
            }, {
                qualifyingEvent: {
                    action: "view-page",
                    page: "page-1"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 1
            }, {
                qualifyingEvent: {
                    action: "view-page",
                    page: "page-2"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 1
            }, {
                qualifyingEvent: {
                    action: "log-out"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 1
            }
        ]
    });
}

module.exports = {
    start
};