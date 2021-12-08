import { Message } from 'discord.js';
import Bot from '../Bot.js';
import { Args } from '../events/message.js';

export function run(client: Bot, message: Message, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`🙄 You have to tell me what you want me to say...`);
    const args = argsx.basic.map(arg => arg.raw + arg.trailing).join('');
    message.delete();
    return message.channel.send('💬 ' + args, { disableMentions: 'all' });
}

export const config = {
    aliases: ['echo', 'speak'],
    selfperms: ['MANAGE_MESSAGES'],
    userperms: ['MANAGE_MESSAGES'],
    description: 'Make the bot say something in the current channel.',
    usage: {
        args: '<...text>'
    }
}
