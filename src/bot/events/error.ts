import Bot from '../Bot.js';

export function run(client: Bot<true>, error: unknown): void {
    if (Number(process.env.LOGLEVEL) >= 1) return console.error(error);
}
