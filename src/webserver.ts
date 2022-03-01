import express from 'express';
import { Request } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
const app = express();

app.get('/', (request, response): void => {
    if (process.env.LOG_WEBSERVER) logRequest(request);
    response.status(200).send('Webserver is online.');
});

app.listen(process.env.PORT);
if (process.env.LOG_WEBSERVER) console.info(`[WEBSERVER] Listening on PORT ${process.env.PORT!}`);

function logRequest(req: Request<object, unknown, unknown, ParsedQs, Record<string, unknown>>): void {
    const date = new Date().toISOString();
    return console.log(`[WEBSERVER-${date}] ${req.method} > ${req.hostname}${req.url}`);
}
