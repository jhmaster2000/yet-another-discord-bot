import { Client, ClientOptions, Collection, Message, User } from 'discord.js';

export default class Bot extends Client {
    constructor(options?: ClientOptions) {
        super(options);

        this.prefixes.push('plz');
        if (!process.env.PRODUCTION) this.prefixes = ['pl'];
    }

    isWin: boolean = process.platform === 'win32';
    prefixes: string[] = [];
    em: { [emojiName: string]: string } = {};
    re: { [emojiName: string]: string } = {};
    owner: User;
    commands: Collection<string, any> = new Collection();
    commandAliases: Collection<string, any> = new Collection();
    
    paginate: (message: Message, pages: any[], pagesCount: number, timeout: number, startPage: number) => void;
    promptYesNo: (from: User, msg: Message, callback: (answer: boolean | null) => void, timeout: number, reactions?: any) => void;
}
