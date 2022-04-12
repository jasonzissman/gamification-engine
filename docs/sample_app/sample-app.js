import { express } from 'express';
import axios from 'axios';
import { issueHttpPost } from '../../test/integration-tests/integration-test-helper';

let GAMIFICATION_ENGINE_PORT;
const SAMPLE_APP_PORT = 31854;

async function start() {
    await startGamificationEngine();
    await addInitialGoalsToGamificationEngine();
    await startExpressSampleApp();
}

async function startGamificationEngine() {
    // TODO - need to replicate a graphDB in place of our old in-memory Mongo
    let gamificationEnginePort = await integrationTestHelper.startTestAppServer(dbHost, dbPort, dbUser, dbPassword);
    GAMIFICATION_ENGINE_PORT = gamificationEnginePort;
}

async function addInitialGoalsToGamificationEngine() {

    // Create power-user goal
    issueHttpPost(`http://localhost:${GAMIFICATION_ENGINE_PORT}/goals`, {
        name: "Power User",
        description: "Log in at least 3 times",
        points: 10,
        criteria: [
            {
                targetEntityIdField: "userId",
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

    // Create newcomer tutorial
    issueHttpPost(`http://localhost:${GAMIFICATION_ENGINE_PORT}/goals`, {
        name: "Newcomer Tutorial",
        description: "Log in, view all pages, and log out",
        points: 50,
        criteria: [
            {
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    action: "log-in"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 1
            }, {
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    action: "view-page",
                    page: "page-1"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 1
            }, {
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    action: "view-page",
                    page: "page-2"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 1
            }, {
                targetEntityIdField: "userId",
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

    // Create been-doing-this-forever goal
    issueHttpPost(`http://localhost:${GAMIFICATION_ENGINE_PORT}/goals`, {
        name: "Been Doing This Forever",
        description: "Perform an activity for 100 seconds",
        points: 100,
        criteria: [
            {
                targetEntityIdField: "userId",
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
    await issueHttpPost(`http://localhost:${GAMIFICATION_ENGINE_PORT}/events`, eventPayload);
}

async function reportPageViewEvent(userId, page) {
    let eventPayload = {
        action: "view-page",
        page: page,
        userId: userId
    };
    await issueHttpPost(`http://localhost:${GAMIFICATION_ENGINE_PORT}/events`, eventPayload);
}

async function reportLogoutEvent(userId) {
    let eventPayload = {
        action: "log-out",
        userId: userId
    };
    await issueHttpPost(`http://localhost:${GAMIFICATION_ENGINE_PORT}/events`, eventPayload);
}

async function reportLoginEvent(userId) {
    let eventPayload = {
        action: "log-in",
        userId: userId
    };
    await issueHttpPost(`http://localhost:${GAMIFICATION_ENGINE_PORT}/events`, eventPayload);
}

function startExpressSampleApp() {
    const app = express();

    app.use('/static', express.static('static'))
    app.use(express.json());


    app.get("/log-in", async (request, response) => {
        // your application's login code here...
        await reportLoginEvent(request.query.userId);
        response.status(200).send({ message: "successfully logged in" });
    });

    app.get("/log-out", async (request, response) => {
        // your application's logout code here...
        await reportLogoutEvent(request.query.userId);
        response.status(200).send({ message: "successfully logged out" });
    });

    app.get("/view-page/:pageName", async (request, response) => {
        // your application's page rendering code here...
        await reportPageViewEvent(request.query.userId, request.params.pageName);
        response.status(200).send({ message: `successfully viewed page ${request.params.pageName}` });
    });

    app.get("/perform-activity", async (request, response) => {
        // your application's perform-activity code here...
        await reportActivityPerformedEvent(request.query.userId, request.query.timePerformingActivity);
        response.status(200).send({ message: `successfully performed activity for ${request.query.timePerformingActivity} seconds.` });
    });

    app.get("/goal-progress", async (request, response) => {
        let gamificationEngineGoalResponse = await issueHttpGet(`http://localhost:${GAMIFICATION_ENGINE_PORT}/goals`);
        let gamificationEngineProgressResponse = await issueHttpGet(`http://localhost:${GAMIFICATION_ENGINE_PORT}/entities/${request.query.userId}`);
        response.status(200).send({
            message: {
                goals: gamificationEngineGoalResponse.data,
                progress: gamificationEngineProgressResponse.data
            }
        });
    });

    app.listen(SAMPLE_APP_PORT, (err) => {
        if (err) {
            console.log(err);
        }

        console.log(`Sample app listening on ${SAMPLE_APP_PORT}.`);
    });
}

export {
    start
};