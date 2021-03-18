const express = require('express');
const router = express.Router();

router.get("/:entityId/progress", (request, response) => {
    // TODO invoke fetch progress routine for specific entity
    response.status(200).send({ status: "ok" });
});

module.exports = router;