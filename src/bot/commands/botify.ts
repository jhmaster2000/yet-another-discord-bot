import { Message, NewsChannel, TextChannel } from 'discord.js';
import Bot from '../Bot.js';
import { Args } from '../events/message.js';

export function run(client: Bot, message: Message, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`${client.em.xmark} Cannot send empty message.`);
    const args = argsx.basic.map(arg => arg.raw + arg.trailing);
    const webhookText = args.join('');

    (message.channel as TextChannel | NewsChannel)
        .createWebhook(message.member!.displayName, {
            avatar: message.author.displayAvatarURL({ dynamic: true, format: 'png' }),
            reason: `User ${message.author.tag} ran "botify" command.`
        })
        .then(webhook => {
            message.delete();
            webhook.send(webhookText, { disableMentions: 'everyone' }).then(() => webhook.delete());
        })
        .catch(err => {
            console.error(err);
            return message.channel.send(`${client.em.xmark} An unexpected error occured when trying to run this command.`);
        });
}

export const config = {
    aliases: ['hook', 'hookify', 'webhookify'],
    selfperms: ['MANAGE_MESSAGES', 'MANAGE_WEBHOOKS'],
    userperms: ['MANAGE_MESSAGES'],
    description: 'Sends a message as you, but as a bot.',
    usage: {
        args: '<...message>'
    }
}
