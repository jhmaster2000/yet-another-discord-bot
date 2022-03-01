import Bot from '../Bot.js';

export function run(client: Bot, debug: unknown): void {
    if (Number(process.env.LOGLEVEL) >= 4) return console.debug(debug);

    /*return Promise.resolve({
        event: 'debug',
        this: this
    });*/
}
