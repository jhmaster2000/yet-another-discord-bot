import Bot from '../Bot.js';

export function run(client: Bot<true>, warn: unknown): void {
    if (Number(process.env.LOGLEVEL) >= 2) return console.warn(warn);
}
