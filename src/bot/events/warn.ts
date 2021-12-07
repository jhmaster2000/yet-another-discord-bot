import Bot from '../Bot.js';

export function run(client: Bot, warn: any): void {
    if (Number(process.env.LOGLEVEL) >= 2) return console.warn(warn);
}
