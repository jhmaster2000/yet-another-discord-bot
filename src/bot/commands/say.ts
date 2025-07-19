import { Message, type PermissionsString } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`🙄 You have to tell me what you want me to say...`);
    const args = argsx.basic.map(arg => arg.raw + arg.trailing).join('');
    void message.delete();
    return message.channel.send({ content: '💬 ' + args, allowedMentions: { parse: [] } });
}

export const config = {
    aliases: ['echo', 'speak'],
    selfperms: ['ManageMessages'] satisfies PermissionsString[],
    userperms: ['ManageMessages'] satisfies PermissionsString[],
    description: 'Make the bot say something in the current channel.',
    usage: {
        args: '<...text>'
    }
}
