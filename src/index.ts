import 'utc-date';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

process.on('uncaughtException', err => console.error('<!!!> UNCAUGHT ERROR:', err));

process.env.workdir = dirname(fileURLToPath(import.meta.url));
process.env.VERSION_TIMESTAMP = new Date().valueOf().toString();
if (fs.existsSync('./.git/refs/heads')) process.env.GIT_HASH = fs.readFileSync('./.git/refs/heads/master').toString().trim();

process.env.LOGLEVEL ||= '2';
process.env.STACKTRACE_LIMIT ||= Error.stackTraceLimit.toString();
Error.stackTraceLimit = Number(process.env.STACKTRACE_LIMIT);

const numLogLevel = Number(process.env.LOGLEVEL);
if (Number.isNaN(numLogLevel) || numLogLevel < 0 || numLogLevel > 4) {
    console.warn(`Invalid LOGLEVEL: ${process.env.LOGLEVEL}. Defaulting to 2.`);
    process.env.LOGLEVEL = '2';
}

console.info(
    `Running as ${process.env.PRODUCTION ? 'PRODUCTION' : 'LOCAL'} environment on ${process.platform}\n` +
    `Logging level: ${process.env.LOGLEVEL} | Stacktrace limit: ${Error.stackTraceLimit}`
);

import('./utils.js');
import('./bot/core.js');
