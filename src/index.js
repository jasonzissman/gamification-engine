const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const logger = require('./helpers/logger.js');

app.use((req, res, next) => {
    logger.info(`Request received at ${req.url}.`);
    next();
});

app.use("/health", require('./health/health-routes.js'));
app.use("/goals", require('./goals/goal-routes.js'));

app.listen(port, (err) => {
    if (err) {
        logger.error(err);
    }

    logger.info(`Listening on ${port}.`);
});