const express = require('express');
const dbHelper = require('../database/db-helper');
const router = express.Router();

router.get("/", async (request, response) => {
    let status = { status: "ok" };

    const dbHealth = await dbHelper.ping();
    if (dbHealth.status !== "ok") {
        status = {status: "cannot connect to database"};
    }

    response.status(200).send(status);
});

module.exports = router;