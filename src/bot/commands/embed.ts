import Discord, { Message, Colors, type HexColorString, DiscordAPIError } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';
import { keyofEnum } from '../../utils.js';

type ColorInput = keyof typeof Colors | 'Random' | HexColorString;
const ColorNames = new Map(keyofEnum(Colors).map(k => [k.toLowerCase(), k]));

export async function run(client: Bot, message: Message, args: Args) {
    const argsr = args.ordered.map(arg => arg.raw + arg.trailing);
    const opts = args.options;

    const description = argsr.join('') || '\u200B';
    const color = (opts.get('color') ?? message.member!.displayHexColor) as ColorInput;
    const author = opts.get('author') ?? message.author.username;
    const url = opts.get('url') ?? null;
    const title = opts.get('title') ?? null;
    const footer = opts.get('footer') ?? null;
    const image = opts.get('image') ?? null;
    const thumb = opts.get('thumb') ?? null;

    void message.delete();
    const embed = new Discord.EmbedBuilder().setTimestamp();
    const errors: string[] = [];

    try {
        if (color[0] === '#') embed.setColor(color as HexColorString);
        else {
            const resolved = ColorNames.get(color.toLowerCase().replaceAll(/[-_\s]+/g, '')) ?? null;
            if (resolved === null) throw void 0;
            embed.setColor(resolved);
        }
    } catch {
        errors.push(`\`--color\`: ${color as string} cannot be resolved to a valid color.`);
    }
    try { embed.setDescription(description); } catch {
        errors.push(`\`description\`: Too long. ${description.length} characters out of 4096 maximum. (${4096 - description.length})`);
    }
    try { embed.setAuthor({ name: author, iconURL: message.author.displayAvatarURL({ extension: 'png' }) }); } catch {
        errors.push(`\`--author\`: Too long. ${author.length} characters out of 256 maximum. (${256 - author.length})`);
    }
    if (title) try { embed.setTitle(title); } catch {
        errors.push(`\`--title\`: Too long. ${title.length} characters out of 256 maximum. (${256 - title.length})`);
    }
    if (footer) try { embed.setFooter({ text: footer }); } catch {
        errors.push(`\`--footer\`: Too long. ${footer.length} characters out of 2048 maximum. (${2048 - footer.length})`);
    }
    if (url) try { embed.setURL(url); } catch {
        errors.push(`\`--url\`: Not a valid URL.`);
    }
    if (image) try { embed.setImage(image); } catch {
        errors.push(`\`--image\`: Not a valid image URL.`);
    }
    if (thumb) try { embed.setThumbnail(thumb); } catch {
        errors.push(`\`--thumb\`: Not a valid image URL.`);
    }
    if (errors.length) return message.channel.send(`${client.em.xmark} **Failed to create embed due to the following issues:**\n${errors.join('\n')}`);
    else try {
        return await message.channel.send({ embeds: [embed] });
    } catch (err) {
        if (err instanceof DiscordAPIError) {
            if (err.code === 50035) {
                // Discord.js URL validation doesn't catch http(s)://example/ or http(s)://example.x/ as invalid, but Discord API does.
                if (err.message.includes('embeds[0].image.')) return message.channel.send(`${client.em.xmark} **Failed to create embed due to invalid \`--image\` URL.**`);
                else if (err.message.includes('embeds[0].thumbnail.')) return message.channel.send(`${client.em.xmark} **Failed to create embed due to invalid \`--thumb\` URL.**`);
                else if (err.message.includes('embeds[0].url[')) return message.channel.send(`${client.em.xmark} **Failed to create embed due to invalid \`--url\` URL.**`);
                else return message.channel.send(`${client.em.xmark} **Failed to create embed due to an unknown issue with the embed's content.**`);
            }
            else return message.channel.send(`${client.em.xmark} **Failed to create embed due to an unknown issue with the embed's content.**`);
        }
        else return message.channel.send(`${client.em.xmark} **Failed to create embed due to an unknown issue.**`);
    }
}

export const config = {
    selfperms: ['ManageMessages', 'EmbedLinks'] satisfies Discord.PermissionsString[],
    userperms: ['ManageMessages', 'EmbedLinks'] satisfies Discord.PermissionsString[],
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
