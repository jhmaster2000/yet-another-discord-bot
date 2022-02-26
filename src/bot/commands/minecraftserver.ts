import Discord, { Message } from 'discord.js';
import got from 'got';
import Bot from '../Bot.js';
import { Args } from '../events/message.js';

interface MOTDObject {
    text: string;
    extra?: MOTDObject[];
    bold?: true;
    italic?: true;
    strikethrough?: true;
    underlined?: true;
}

interface Schema {
    status: string,
    online: boolean,
    motd: string,
    motd_json: string | MOTDObject,
    favicon: string,
    error: string | null,
    players: {
        max: number,
        now: number,
        sample: ({ name: string, id: string })[]
    },
    server: {
        name: string,
        protocol: number
    },
    last_updated: string, // UNIX timestamp (seconds)
    duration: string // Nanoseconds
}

export function run(client: Bot, message: Message, args: Args) {
    if (!args.ordered.length) return message.channel.send(`${client.em.xmark} No Minecraft server IP provided.`);

    const ip = args.ordered[0].value.split(':');
    const ipAddress = ip[0];
    const port = ip[1] || '25565';
    return got.get(`http://mcapi.us/server/status?ip=${ipAddress}&port=${port}`).then(response => {
        const server = JSON.parse(response.body);
        if (server.error) return message.channel.send(`${client.em.xmark} Error: ${server.error}`);
        if (!server.online) {
            const embed = new Discord.MessageEmbed()
                .setColor(0xFF0000)
                .setTitle(ipAddress + ':' + port)
                .setDescription('`Server is offline.`');
            return message.channel.send(embed);
        }

        const embed = new Discord.MessageEmbed()
            .setColor(0x00FF21)
            .setTitle(port === '25565' ? ipAddress : `${ipAddress}:${port}`)
            .setDescription(parseMOTD(server.motd_json, server.motd).replace(/\|/g, '|\u200B'))
            .addField('Players', `${server.players.now}/${server.players.max}`, true)
            .addField('Version', removeColorCodes(server.server.name).replace(/\|/g, '|\u200B') || '`Unknown`', true)
            .addField('Protocol', server.server.protocol || '`Unknown`', true)
            .setFooter(`Last Updated ${new Date(server.last_updated * 1000).toUTCString()}`, message.author.avatarURL() ?? undefined);

        if (server.favicon) {
            const faviconData = Buffer.from(server.favicon.split(',').slice(1).join(','), 'base64');
            embed.attachFiles([new Discord.MessageAttachment(faviconData, 'favicon.png')]).setThumbnail("attachment://favicon.png");
        }
        return message.channel.send(embed);
    }).catch(err => {
        console.error(err);
        message.channel.send(`${client.em.xmark} An unexpected error occured trying to fetch server data, try again later.`);
    });
}

function parseEntry(e: MOTDObject): string {
    let text = e.text;
    if (e.extra) text += e.extra.map(parseEntry).join('');
    if (e.bold && e.italic) text = `***${text}***\u200B`;
    if (e.bold && !e.italic) text = `**${text}**\u200B`;
    if (e.italic && !e.bold) text = `*${text}*\u200B`;
    if (e.strikethrough) text = `~~${text}~~\u200B`;
    if (e.underlined) text = `__${text}__\u200B`;
    return text;
}

function parseMOTD(motdjson: string | MOTDObject, motd: string) {
    if (!motdjson && !motd) return 'A Minecraft Server';
    if (typeof motdjson === 'string') return removeColorCodes(motdjson || motd || 'A Minecraft Server');
    if (!Object.keys(motdjson).length) return removeColorCodes(motd || 'A Minecraft Server');
    if (!motdjson.extra) return removeColorCodes(motdjson.text || motd || 'A Minecraft Server');
    return motdjson.text + motdjson.extra.map(parseEntry).join('');
}

function removeColorCodes(str: string): string {
    return str.includes('§') ? str.replace(/§[a-f\dkrmnlo]/gi, '') : str;
}

export const config = {
    aliases: ['mcsv', 'mcs', 'mcserver'],
    description: 'Fetch information on a Minecraft server.',
    selfperms: ['EMBED_LINKS'],
    usage: {
        args: '<server_ip>'
    }
}
