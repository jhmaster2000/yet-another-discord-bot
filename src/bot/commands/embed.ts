import Discord, { type ColorResolvable, DiscordAPIError, Message } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export async function run(client: Bot, message: Message, args: Args): Promise<Discord.Message | undefined> {
    const argsr = args.ordered.map(arg => arg.raw + arg.trailing);
    const opts = args.options;

    const description = argsr.join('') || '\u200B';
    const title = opts.get('title') ? opts.get('title') : null;
    const url = opts.get('url') ? opts.get('url') : null;
    const author = opts.get('author') ? opts.get('author') : message.author.username;
    const footer = opts.get('footer') ? opts.get('footer') : null;
    const color = opts.get('color') ? opts.get('color') : message.member!.displayHexColor;
    const image = opts.get('image') ? opts.get('image') : null;
    const thumb = opts.get('thumb') ? opts.get('thumb') : null;

    const embed = new Discord.EmbedBuilder()
        .setAuthor({ name: author!, iconURL: message.author.displayAvatarURL({ extension: 'png' }) })
        .setDescription(description)
        .setColor(color as ColorResolvable)
        .setTimestamp();
    if (title) embed.setTitle(title);
    if (footer) embed.setFooter({ text: footer });
    if (url) embed.setURL(url);
    if (image) embed.setImage(image);
    if (thumb) embed.setThumbnail(thumb);

    void message.delete();
    try {
        return message.channel.send({ embeds: [embed] });
    } catch (e: unknown) {
        const err = e as DiscordAPIError;
        if (err.code === 50035) {
            let errlist: string[] = [];
            let errmsgs: string[] = err.message.split('\n');
            errmsgs.shift();
            errmsgs.forEach(el => {
                if (el.startsWith('embeds[0].'))
                    return;
                let opt = el.split(': ')[0].slice(6).replace('nail.url', '').replace('.url', '').replace('.name', '').replace('.text', '');
                let optmsg = el;
                if (opt === 'description')
                    return errlist.push(`\`description\`: Too long.  ${description.length} characters out of 2048 maximum. (${2048 - description.length})`);
                if (opt === 'footer')
                    return errlist.push(`\`--footer\`: Too long.  ${footer!.length} characters out of 2048 maximum. (${2048 - footer!.length})`);
                if (opt === 'title')
                    return errlist.push(`\`--title\`: Too long.  ${title!.length} characters out of 256 maximum. (${256 - title!.length})`);
                if (opt === 'author')
                    return errlist.push(`\`--author\`: Too long.  ${author!.length} characters out of 256 maximum. (${256 - author!.length})`);
                if (opt === 'url')
                    optmsg = 'Not a valid URL.';
                if (opt === 'image')
                    optmsg = 'Not a valid URL.';
                if (opt === 'thumb')
                    optmsg = 'Not a valid URL.';
                return errlist.push(`\`--${opt}\`: ${optmsg}`);
            });
            return message.channel.send(`${client.em.xmark} **Failed to create embed due to the following issues:**\n${errlist.join('\n')}`);
        }
        return void console.error(err);
    }
}

export const config = {
    selfperms: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    userperms: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    description: 'Creates a custom embed for you.',
    usage: {
        args: '[...embed_description]',
        options: {
            title: {
                value: '"<...text>"',
                info: 'The text for the embed\'s title.'
            },
            url: {
                value: '<url>',
                info: 'Any website link to be linked on the embed title.'
            },
            author: {
                value: '"<...text>"',
                info: 'The text for the embed\'s author field.'
            },
            footer: {
                value: '"<...text>"',
                info: 'The text for the embed\'s footer.'
            },
            color: {
                value: '<color_code>',
                info: 'A color, either hex code (#ff0000) or a color name (red).'
            },
            image: {
                value: '<image_url>',
                info: 'A link to an image to be the embed\'s main image.'
            },
            thumb: {
                value: '<image_url>',
                info: 'A link to an image to be the embed\'s thumbnail.'
            }
        }
    }
};
