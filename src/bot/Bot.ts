import { Client, ClientOptions, Collection, Message, MessageEmbed, User } from 'discord.js';
import Command from './Command.js';
import { CustomReactions } from './reactionListener.js';

export default class Bot extends Client {
    constructor(options: ClientOptions) {
        super(options);

        this.prefixes.push('plz');
        if (!process.env.PRODUCTION) this.prefixes = ['pl'];
    }

    owner!: User;
    prefixes: string[] = [];
    em: { [emojiName: string]: string } = {};
    re: { [emojiName: string]: string } = {};
    commands: Collection<string, Command> = new Collection();
    commandAliases: Collection<string, string> = new Collection();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    readonly events: EventStorage = (<any>this)._events as EventStorage;
    readonly isWin: boolean = process.platform === 'win32';

    paginate!: (message: Message, pages: MessageEmbed[], pagesCount: number, timeout?: number, startPage?: number) => void;
    promptYesNo!: (from: User, msg: Message, callback: (answer: boolean | null) => void, timeout?: number, reactions?: CustomReactions) => void;
}

type EventStorage = { [eventName: string]: ((...args: unknown[]) => void) | ((...args: unknown[]) => void)[] };
