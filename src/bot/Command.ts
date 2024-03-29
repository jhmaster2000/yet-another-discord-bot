import { Message, type PermissionsString } from 'discord.js';
import Bot from './Bot.js';
import { type Args } from './events/messageCreate.js';

export default interface Command {
    config: CommandConfig;
    run(client: Bot, message: Message, args: Args): unknown;
}

export interface CommandConfig {
    name: string;
    description: string,
    selfperms?: PermissionsString[],
    userperms?: PermissionsString[],
    aliases?: string[],
    disabled?: boolean,
    deprecated?: boolean,
    usage?: {
        args?: string,
        flags?: { [flag: string]: string },
        options?: {
            [option: string]: {
                value: string,
                info: string
            }
        }
    }
}
