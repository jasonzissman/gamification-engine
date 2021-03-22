const express = require('express');
const logger = require('./utility/logger');
const dbHelper = require('./database/db-helper');
const eventCriteriaMatcher = require('./event/event-criteria-matcher');

const port = process.env.PORT || 3000;
const dbConnString = process.env.DB_CONN_STRING || "mongodb://localhost:27017";

async function start() {
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

function startExpressApp() {

    const app = express();

    app.use((req, res, next) => {
        logger.info(`Request received at ${req.url}.`);
        next();
    });

    app.use(express.json());

    app.use("/event", require('./event/event-routes.js'));
    app.use("/health", require('./health/health-routes.js'));
    app.use("/goal", require('./goal/goal-routes.js'));
    app.use("/entity", require('./entity/entity-routes.js'));

    app.listen(port, (err) => {
        if (err) {
            logger.error(err);
        }

        logger.info(`Listening on ${port}.`);
    });
}

start();