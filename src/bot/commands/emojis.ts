import { Message, Util } from 'discord.js';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export async function run(client: Bot, message: Message, args: Args) {
    const emojiList = message.guild!.emojis.cache.map(e => e.toString());
    for (const m of Util.splitMessage(
        `**__Here's a list of all the custom emojis on this server (${emojiList.length}):__**\n${emojiList.join(' ')}`,
        { char: ' ', prepend: '​' })
    ) {
        await message.channel.send(m);
    };
}

export const config = {
    aliases: ['emotes', 'serveremojis', 'serveremotes', 'guildemojis', 'guildemotes'],
    description: 'Lists all custom emojis in the current server.'
};
