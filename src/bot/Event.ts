import Bot from './Bot.js';

export default interface Event {
    run(client: Bot<true>, ...args: unknown[]): unknown;
}
