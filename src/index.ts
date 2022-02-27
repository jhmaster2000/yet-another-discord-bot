import 'utc-date';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

process.on('uncaughtException', err => console.error('<!!!> UNCAUGHT ERROR:', err));
process.env.VERSION_TIMESTAMP = new Date().valueOf().toString();
if (fs.existsSync('./.git/refs/heads')) process.env.GIT_HASH = fs.readFileSync('./.git/refs/heads/master').toString().trim(); // comment out this line if not using git
process.env.workdir = dirname(fileURLToPath(import.meta.url));

console.info(
    `Running as ${process.env.PRODUCTION ? 'PRODUCTION' : 'LOCAL'} environment on ${process.platform}\n` +
    `Logging level: ${process.env.LOGLEVEL} | Stacktrace limit: ${process.env.STACKTRACE_LIMIT}`
);

import('./utils.js');
import('./bot/core.js');
import('./webserver.js');
