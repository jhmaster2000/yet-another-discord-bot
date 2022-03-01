import Bot from './Bot.js';

export default interface Event {
    run(client: Bot, ...args: unknown[]): unknown;
}
