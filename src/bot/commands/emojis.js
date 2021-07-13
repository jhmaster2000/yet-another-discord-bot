export function run(client, message, args) {
    const emojiList = message.guild.emojis.cache.map(e => e.toString());
    return message.channel.send(`**__Here's a list of all the custom emojis on this server (${emojiList.length}):__**\n${emojiList.join(' ')}`, { split: { char: ' ', prepend: '​' } });
}

export const config = {
    aliases: ['emotes', 'serveremojis', 'serveremotes', 'guildemojis', 'guildemotes'],
    description: 'Lists all custom emojis in the current server.'
};