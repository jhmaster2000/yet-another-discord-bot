import Discord from 'discord.js';

export function run(client, message, args) {
    const maxres = args.flags.has('maxres') ? '?size=4096' : '';
    args = args.ordered.map(arg => arg.value);

    if (!args.length) {
        const embed_self = new Discord.MessageEmbed()
            .setTitle(`${RegExp.escapeMarkdown(message.author.tag)}'s Avatar`)
            .setImage(message.author.displayAvatarURL({ dynamic: true, format: 'png' }) + maxres);
        return message.channel.send(embed_self);
    }
    
    if (message.mentions.users.array().length >= 1) {
        const embed_mention = new Discord.MessageEmbed()
            .setTitle(`${RegExp.escapeMarkdown(message.mentions.users.first().tag)}'s Avatar`)
            .setImage(message.mentions.users.first().displayAvatarURL({ dynamic: true, format: 'png' }) + maxres);
        return message.channel.send(embed_mention);
    }

    const targetUser = client.users.cache.get(args[0]);
    if (!targetUser) return message.channel.send(`${client.em.xmark} Please provide a valid user.`);

    const embed_other = new Discord.MessageEmbed()
        .setTitle(RegExp.escapeMarkdown(targetUser.tag) + '\'s Avatar')
        .setImage(targetUser.displayAvatarURL({ dynamic: true, format: 'png' }) + maxres);
    return message.channel.send(embed_other);
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