import express from 'express';
const app = express();

app.get('/', (request, response) => {
    if (process.env.LOG_WEBSERVER) logRequest(request);
    response.status(200).send('Webserver is online.');
});

app.listen(process.env.PORT);
if (process.env.LOG_WEBSERVER) console.info(`[WEBSERVER] Listening on PORT ${process.env.PORT}`);

function logRequest(req) {
    const date = new Date().toISOString();
    const logstr = `[WEBSERVER-${date}] ${req.method} > ${req.hostname}${req.url}`;
    console.log(logstr);
};