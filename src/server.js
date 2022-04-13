import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

import { log } from './utility/logger.js';
import { initDbConnection } from './database/db-helper.js';
import { router as healthRoutes } from "./health/health-routes.js"
import { router as goalRoutes } from "./goal/goal-routes.js"
import { router as eventRoutes } from "./event/event-routes.js"
import { router as entityRoutes } from "./entity/entity-routes.js"

async function startServer(appServerPort, neo4jBoltUri, neo4jUser, neo4jPassword) {

    await initDbConnection(neo4jBoltUri, neo4jUser, neo4jPassword);

    const app = express();

    var swaggerDocument = JSON.parse(fs.readFileSync(`./src/swagger.json`, `utf8`));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/schemas', express.static('src/schemas'))

    app.use((req, res, next) => {
        log(`Request received: ${req.method} ${req.url}.`);
        next();
    });

    app.use(express.json());

    app.use("/health", healthRoutes);
    app.use("/goals", goalRoutes);
    app.use("/events", eventRoutes);
    app.use("/entities", entityRoutes);

    appServerPort = appServerPort || 3000;

    return await app.listen(appServerPort, (err) => {
        if (err) {
            log(err);
        }

        log(`Listening on ${appServerPort}.`);
    });
}

async function stopServer(httpServer) {
    await httpServer.close();
}

export {
    startServer,
    stopServer
};