import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { ValidationError } from "express-json-validator-middleware";

import { log } from './utility/logger.js';
import { initDbConnection } from './database/db-helper.js';
import { router as healthRoutes } from "./health/health-routes.js"
import { router as goalRoutes } from "./goal/goal-routes.js"
import { router as activityRoutes } from "./activity/activity-route.js"
import { router as entityRoutes } from "./entity/entity-routes.js"

async function startServer(appServerPort, neo4jBoltUri, neo4jUser, neo4jPassword) {

    // await initDbConnection(neo4jBoltUri, neo4jUser, neo4jPassword);

    const app = express();

    app.use('/schemas', express.static('src/schemas'))

    var swaggerDocument = JSON.parse(fs.readFileSync(`./src/swagger.api.v1.json`, `utf8`));
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use((req, res, next) => {
        log(`Request received: ${req.method} ${req.url}.`);
        next();
    });

    app.use(express.json());

    app.use("/health", healthRoutes);
    app.use("/api/v1/goals", goalRoutes);
    app.use("/api/v1/activities", activityRoutes);
    app.use("/api/v1/entities", entityRoutes);

    // handle schema validation errors
    app.use((error, request, response, next) => {
        if (error instanceof ValidationError) {
            response.status(400).send(error.validationErrors);
            next();
        } else {
            next(error);
        }
    });

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