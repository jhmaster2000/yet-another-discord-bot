import { GuildEmoji, Message } from 'discord.js';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export async function run(client: Bot, message: Message, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`${client.em.xmark} Please provide at least **1** custom emoji to delete.`);
    let args = argsx.basic.map(arg => arg.raw);
    args = args.join(' ').replace(/<a??:(\w{2,32}):([0-9]{17,20})>/g, match => match + ' ').split(' ');

    let emojis: GuildEmoji[] = [];
    args.forEach(arg => {
        const parsedEmoji = arg.trim().match(/<a??:(\w{2,32}):([0-9]{17,20})>/);
        if (!parsedEmoji) return;
        const emoji = message.guild!.emojis.cache.get(parsedEmoji[2]);
        if (emoji) emojis.push(emoji);
    });
    if (!emojis.length) return message.channel.send(`${client.em.xmark} Failed to parse any valid __custom emojis in this server__ from your input.`);

    const protectedEmojis = emojis.filter(emoji => !emoji.deletable);
    let s = protectedEmojis.length === 1 ? '' : 's';
    let s2 = s ? 'these' : 'this';
    const protectedWarning = protectedEmojis.length ? `⚠️ Unable to delete ${s2} **${protectedEmojis.length}** custom emoji${s} due to them being protected by Discord: ${protectedEmojis.join(' ')}` : '';
    if (protectedEmojis.length) emojis = emojis.filter(emoji => emoji.deletable);

    if (emojis.length > 5) return message.channel.send(`${client.em.xmark} Only up to **5** custom emojis can be deleted at once.`);

    s = emojis.length === 1 ? '' : 's';
    s2 = s ? 'these' : 'this';
    const msg = await message.channel.send(`${protectedWarning}\n\n⁉️ Are you sure you want to __permanently__ delete ${s2} **${emojis.length}** custom emoji${s}?: ${emojis.join(' ')}`);
    return client.promptYesNo(message.author, msg, (answer) => {
        msg.reactions.removeAll();
        const timedout = answer === null ? '(Timed out)' : '';
        if (!answer)
            return msg.edit(`${client.em.neutral} Cancelled deletion of **${emojis.length}** custom emoji${s}. ${timedout}`);

        emojis.forEach(emoji_3 => emoji_3.delete(`Requested by user: ${message.author.tag}`).catch(error => message.channel.send(`bruh error:\n${error}`)));
        return msg.edit(`${client.em.check} Successfully deleted **${emojis.length}** custom emoji${s}: \`:${emojis.map(e => e.name).join(':` `:')}:\``);
    });
}

export const config = {
    aliases: ['deleteemoji', 'deleteemojis', 'delemojis'],
    userperms: ['MANAGE_EMOJIS'],
    selfperms: ['MANAGE_EMOJIS', 'ADD_REACTIONS'],
    description: 'Deletes between 1 to 5 custom server emojis.',
    usage: {
        args: '<...:emoji:>'
    }
};
