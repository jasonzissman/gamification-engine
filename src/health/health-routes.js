const express = require('express');
const router = express.Router();

router.get("/", (request, response) => {
    // TODO - check DB connection
    response.status(200).send({ status: "ok" });
});

module.exports = router;