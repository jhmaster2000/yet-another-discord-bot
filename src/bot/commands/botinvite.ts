import { Message } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, args: Args) {
    const permissions = 4259179767 as const;
    const link = `<https://discordapp.com/oauth2/authorize?client_id=${client.user!.id}&scope=bot&permissions=${permissions}>` as const;
    return message.channel.send(`**__Use the link below to invite the bot to your server:__**\n${link}`);
}

export const config = {
    aliases: ['binv', 'botinv'],
    description: 'Provides invite link to add the bot to your server.'
}
