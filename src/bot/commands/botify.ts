import { Message, NewsChannel, TextChannel, type PermissionsString } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export async function run(client: Bot<true>, message: Message<true>, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`${client.em.xmark} Cannot send empty message.`);
    const args = argsx.basic.map(arg => arg.raw + arg.trailing);
    const webhookText = args.join('');

    try {
        const webhook = await (message.channel as TextChannel | NewsChannel).createWebhook({
            name: message.member!.displayName,
            avatar: message.author.displayAvatarURL({ extension: 'png' }),
            reason: `User ${message.author.tag} ran "botify" command.`
        });
        await message.delete();
        await webhook.send({ content: webhookText, allowedMentions: { parse: ['users'] } });
        return webhook.delete();
    } catch (err) {
        console.error(err);
        return message.channel.send(`${client.em.xmark} An unexpected error occured when trying to run this command.`);
    }
}

export const config = {
    aliases: ['hook', 'hookify', 'webhookify'],
    selfperms: ['ManageMessages', 'ManageWebhooks'] satisfies PermissionsString[],
    userperms: ['ManageMessages'] satisfies PermissionsString[],
    description: 'Sends a message as you, but as a bot.',
    usage: {
        args: '<...message>'
    }
}
