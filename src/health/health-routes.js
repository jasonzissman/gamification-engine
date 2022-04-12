import express from 'express';
import { ping } from  '../database/db-helper.js';

const router = express.Router();

router.get("/", async (request, response) => {
    let status = { status: "ok" };

    const dbHealth = await ping();
    if (dbHealth.status !== "ok") {
        status = {status: "cannot connect to database"};
    }

    response.status(200).send(status);
});

export { router };