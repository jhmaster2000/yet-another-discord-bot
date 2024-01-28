import { Message } from 'discord.js';
import prettyms from 'pretty-ms';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, args: Args) {
    return message.channel.send(`🕓 **I have been online for** \`${prettyms(client.uptime!)}\`**!**`);
}

export const config = {
    description: 'Shows how long the bot has been online for.',
}
