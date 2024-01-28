import express from 'express';
import { type Request as ESSCRequest } from 'express-serve-static-core';
const app = express();

app.get('/', (request, response): void => {
    if (process.env.LOG_WEBSERVER) logRequest(request);
    response.status(200).send('Webserver is online.');
});

app.listen(process.env.PORT);
if (process.env.LOG_WEBSERVER) console.info(`[WEBSERVER] Listening on PORT ${process.env.PORT!}`);

function logRequest(req: ESSCRequest): void {
    const date = new Date().toISOString();
    return console.log(`[WEBSERVER-${date}] ${req.method} > ${req.hostname}${req.url}`);
}
