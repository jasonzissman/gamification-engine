const express = require('express');
const router = express.Router();

router.post("/", (request, response) => {
    // invoke goal creation routine
    response.status(200).send({ status: "ok" });
});

router.put("/", (request, response) => {
    // invoke goal update routine
    response.status(200).send({ status: "ok" });
});

router.get("/", (request, response) => {
    // invoke goal fetch-all routine
    response.status(200).send({ status: "ok" });
});

module.exports = router;