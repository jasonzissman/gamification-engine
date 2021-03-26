const express = require('express');


const app = express();

app.use('/static', express.static('static'))
app.use(express.json());

const port = process.env.PORT || 3001;

httpServer = app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }

    console.log(`Sample app listening on ${port}.`);
});
