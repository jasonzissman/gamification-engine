const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const logger = require('./helpers/logger.js');

app.use((req, res, next) => {
    logger.info(`Request received at ${req.url}.`);
    next();
});

app.get("/health", (request, response) => {
    response.status(200).send({ status: "ok" });
});

app.listen(port, (err) => {
    if (err) {
        logger.error(err);
    }

    logger.info(`Listening on ${port}.`);
});