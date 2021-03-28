const express = require('express');
const logger = require('./utility/logger');
const dbHelper = require('./database/db-helper');
const eventCriteriaMatcher = require('./event/event-criteria-matcher');

let httpServer;

async function start() {
    const dbConnString = process.env.DB_CONN_STRING || "mongodb://localhost:27017";
    const connectionAttempt = await dbHelper.initDbConnection(dbConnString);

    if (connectionAttempt.status === "ok") {
        let existingCriteria = await dbHelper.getAllCriteria();
        await eventCriteriaMatcher.initCriteriaLookupMap(existingCriteria);
        startExpressApp();
    } else {
        logger.error("Failed to connect to database! App not starting.");
        logger.error(connectionAttempt.message);
    }
}

async function shutDown() {
    await dbHelper.closeAllDbConnections();
    await httpServer.close();
}

function startExpressApp() {

    const app = express();

    app.use((req, res, next) => {
        logger.info(`Request received: ${req.method} ${req.url}.`);
        next();
    });

    app.use(express.json());

    app.use("/events", require('./event/event-routes.js'));
    app.use("/health", require('./health/health-routes.js'));
    app.use("/goals", require('./goal/goal-routes.js'));
    app.use("/entities", require('./entity/entity-routes.js'));

    const port = process.env.PORT || 3000;

    httpServer = app.listen(port, (err) => {
        if (err) {
            logger.error(err);
        }

        logger.info(`Listening on ${port}.`);
    });
}

module.exports = {
    start,
    shutDown
};