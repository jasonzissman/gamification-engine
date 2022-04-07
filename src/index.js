const express = require('express');
const logger = require('./utility/logger');
const dbHelper = require('./database/db-helper');

let httpServer;

async function start() {

    await dbHelper.initDbConnection();

    const app = express();

    app.use((req, res, next) => {
        logger.info(`Request received: ${req.method} ${req.url}.`);
        next();
    });

    app.use(express.json());

    app.use("/health", require('./health/health-routes.js'));
    app.use("/goals", require('./goal/goal-routes.js'));
    // app.use("/events", require('./event/event-routes.js'));
    // app.use("/entities", require('./entity/entity-routes.js'));

    const port = process.env.PORT || 3000;

    httpServer = app.listen(port, (err) => {
        if (err) {
            logger.error(err);
        }

        logger.info(`Listening on ${port}.`);
    });
}

start();