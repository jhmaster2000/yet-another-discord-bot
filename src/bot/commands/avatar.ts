import Discord, { Message } from 'discord.js';
import Utils from '../../utils.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, argso: Args) {
    const maxres = argso.flags.has('maxres') ? '?size=4096' : '';
    const args = argso.ordered.map(arg => arg.value);

    if (!args.length) {
        const embedSelf = new Discord.EmbedBuilder()
            .setTitle(`${Utils.escapeMarkdown(message.author.tag)}'s Avatar`)
            .setImage(message.author.displayAvatarURL({ extension: 'png' }) + maxres);
        return message.channel.send({ embeds: [embedSelf] });
    }
    
    if ([...message.mentions.users.values()].length >= 1) {
        const embedMention = new Discord.EmbedBuilder()
            .setTitle(`${Utils.escapeMarkdown(message.mentions.users.first()!.tag)}'s Avatar`)
            .setImage(message.mentions.users.first()!.displayAvatarURL({ extension: 'png' }) + maxres);
        return message.channel.send({ embeds: [embedMention] });
    }

    const targetUser = client.users.cache.get(args[0]);
    if (!targetUser) return message.channel.send(`${client.em.xmark} Please provide a valid user.`);

    const embedOther = new Discord.EmbedBuilder()
        .setTitle(Utils.escapeMarkdown(targetUser.tag) + '\'s Avatar')
        .setImage(targetUser.displayAvatarURL({ extension: 'png' }) + maxres);
    return message.channel.send({ embeds: [embedOther] });
}

export const config = {
    aliases: ['pfp'],
    selfperms: ['EMBED_LINKS'],
    description: 'Gets the avatar of a user.',
    usage: {
        args: '[@user | user_id]',
        flags: {
            maxres: 'Get the avatar in the highest resolution possible.'
        }
    }
}
