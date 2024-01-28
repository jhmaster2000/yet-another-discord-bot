import { type CategoryChannelResolvable, Message, ChannelType, GuildPremiumTier } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

const ChannelTypes = {
    GUILD_TEXT: 0,
    DM: 1,
    GUILD_VOICE: 2,
    GROUP_DM: 3,
    GUILD_CATEGORY: 4,
    GUILD_NEWS: 5,
    GUILD_STORE: 6,
    UNKNOWN: 7,
    GUILD_NEWS_THREAD: 10,
    GUILD_PUBLIC_THREAD: 11,
    GUILD_PRIVATE_THREAD: 12,
    GUILD_STAGE_VOICE: 13
} as const;

export function run(client: Bot, message: Message, args: Args) {
    if (!args.ordered.length) return message.channel.send(`${client.em.xmark} A channel name is required!`);
    const argsv = args.ordered.map(arg => arg.raw);

    const type = (args.flags.has('voice') || args.flags.has('vc')) ? ChannelTypes.GUILD_VOICE : (args.flags.has('category') || args.flags.has('cat')) ? ChannelTypes.GUILD_CATEGORY : ChannelTypes.GUILD_TEXT;
    const position = Number(args.options.get('position') || args.options.get('pos')) || null;
    const category = args.options.get('category') || args.options.get('cat');
    const nsfw = args.flags.has('nsfw');
    const slowmode = parseSlowmode(client, message, args.options.get('slowmode') || args.options.get('slow') || '0');
    const topic = args.options.get('topic')?.slice(0, 1024) || args.options.get('t')?.slice(0, 1024);
    const name = type === ChannelTypes.GUILD_TEXT ? argsv.join('-').slice(0, 100) : argsv.join(' ').slice(0, 100);

    if (type === ChannelTypes.GUILD_TEXT && isNaN(slowmode!)) return; // Response on parseSlowmode() function

    const categorychannel = message.guild!.channels.cache.get(category!);
    if (type !== ChannelTypes.GUILD_CATEGORY && category) {
        if (!categorychannel) return message.channel.send(`${client.em.xmark} Failed to parse the **category** option into a valid category channel.`);
        if (categorychannel.type !== ChannelType.GuildCategory) return message.channel.send(`${client.em.xmark} ${String(categorychannel)} is not a category!`);
    }

    const vc_bitrate = Number(args.options.get('bitrate') || args.options.get('kbps'));
    const vc_userlimit = Number(args.options.get('userlimit') || args.options.get('users'));
    if (type === ChannelTypes.GUILD_VOICE) {
        if (message.guild!.premiumTier === GuildPremiumTier.None  && (vc_bitrate < 8 || vc_bitrate > 96))  return message.channel.send(`${client.em.xmark} The bitrate must be between \`8\` and \`96\` (in kbps)`);
        if (message.guild!.premiumTier === GuildPremiumTier.Tier1 && (vc_bitrate < 8 || vc_bitrate > 128)) return message.channel.send(`${client.em.xmark} The bitrate must be between \`8\` and \`128\` (in kbps)`);
        if (message.guild!.premiumTier === GuildPremiumTier.Tier2 && (vc_bitrate < 8 || vc_bitrate > 256)) return message.channel.send(`${client.em.xmark} The bitrate must be between \`8\` and \`256\` (in kbps)`);
        if (message.guild!.premiumTier === GuildPremiumTier.Tier3 && (vc_bitrate < 8 || vc_bitrate > 384)) return message.channel.send(`${client.em.xmark} The bitrate must be between \`8\` and \`384\` (in kbps)`);
        if (vc_userlimit < 0 || vc_userlimit > 99) return message.channel.send(`${client.em.xmark} The user limit must be between \`0\` and \`99\``);
    }

    if (position !== null && isNaN(position)) return message.channel.send(`${client.em.xmark} Failed to parse the **position** option into a valid number.`);
    if (position !== null && (position < 1 || position > 2147483648)) return message.channel.send(`${client.em.xmark} The position must be between \`1\` and \`2147483648\``);

    return message.guild!.channels.create({
        name: name, // channel name
        type: type, // GUILD_TEXT
        //position: undefined, // this is actually rawPosition and not position, so position must be set afterwards
        parent: type !== ChannelTypes.GUILD_CATEGORY && category ? category as CategoryChannelResolvable : undefined as unknown as CategoryChannelResolvable, // No category
        nsfw: type === ChannelTypes.GUILD_TEXT && nsfw ? nsfw : false, // false
        topic: type === ChannelTypes.GUILD_TEXT && topic ? topic : '', // blank
        rateLimitPerUser: type === ChannelTypes.GUILD_TEXT && slowmode ? Math.round(slowmode) : 0, // 0 (seconds)
        bitrate: type === ChannelTypes.GUILD_VOICE && vc_bitrate ? Math.round(vc_bitrate * 1000) : 64000, // 64000 (64kbps)
        userLimit: type === ChannelTypes.GUILD_VOICE && vc_userlimit ? Math.round(vc_userlimit) : 0, // 0 (No Limit)
        reason: `Requested by user: ${message.author.tag}`
    }).then(channel => {
        if (position) void channel.setPosition(Math.round(position) - 1);
        // @ts-expect-error TS fail
        if (channel.type !== ChannelType.GuildCategory) return void message.channel.send(`${client.em.check} Successfully created new ${type} channel **${String(channel)}** at position \`${Math.round(position!) || channel.position}\` on category **${channel.parent?.name || 'Default'}**`);
        else return void message.channel.send(`${client.em.check} Successfully created new category **${channel.name}** at position \`${Math.round(position!) || channel.position}\``);
    }).catch(console.error);
}

function parseSlowmode(client: Bot, message: Message, slowmode: string): number | undefined {
    if (!isNaN(Number(slowmode))) {
        if (Number(slowmode) < 0 || Number(slowmode) > 21600) return void message.channel.send(`${client.em.xmark} The slowmode must be between \`0\` and \`21600\` seconds`);
        else return Number(slowmode);
    }
    if (!isNaN(Number(slowmode.slice(0, -1)))) {
        const unit = slowmode.slice(-1);
        slowmode = slowmode.slice(0, -1);
        if (unit === 's') {
            if (Number(slowmode) < 0 || Number(slowmode) > 21600) return void message.channel.send(`${client.em.xmark} The slowmode must be between \`0\` and \`21600\` seconds`);
            else return Number(slowmode);
        }
        if (unit === 'm') {
            slowmode = String(Number(slowmode) * 60);
            if (Number(slowmode) < 0 || Number(slowmode) > 21600) return void message.channel.send(`${client.em.xmark} The slowmode must be between \`0\` and \`360\` minutes`);
            else return Number(slowmode);
        }
        if (unit === 'h') {
            slowmode = String(Number(slowmode) * 60 * 60);
            if (Number(slowmode) < 0 || Number(slowmode) > 21600) return void message.channel.send(`${client.em.xmark} The slowmode must be between \`0\` and \`6\` hours`);
            else return Number(slowmode);
        }
        return void message.channel.send(`${client.em.xmark} \`${unit}\` is not a valid time unit for slowmode. Please use \`h\`, \`m\` or \`s\` (default)`);
    }
    return void message.channel.send(`${client.em.xmark} Failed to parse the **slowmode** option into a valid time unit. (Try: \`5s\` or \`2m\`)`);
}

export const config = {
    aliases: ['addchannel', 'createchannel', 'makechannel'],
    userperms: ['MANAGE_CHANNELS'],
    selfperms: ['MANAGE_CHANNELS'],
    description: 'Creates a new Discord channel in the server.',
    usage: {
        args: '<...channel_name>',
        flags: {
            voice: 'Create a voice channel.',
            vc: 'Shortcut for --voice',
            category: 'Create a channel category.',
            cat: 'Shortcut for --category',
            nsfw: 'Mark the channel as NSFW (Text channel only)'
        },
        options: {
            topic: {
                value: '"<...text>"',
                info: 'The channel topic. (Text channel only)'
            },
            category: {
                value: '<category_id>',
                info: 'The ID of a category this channel should be placed on.'
            },
            cat: {
                value: '<category_id>',
                info: 'Shortcut for --category='
            },
            position: {
                value: '<number>',
                info: 'The **N**th position of the channel on the channel list, relative to it\'s category.'
            },
            pos: {
                value: '<number>',
                info: 'Shortcut for --position='
            },
            slowmode: {
                value: '<time>',
                info: 'The slowmode time to apply to the channel, such as **5s** or **2m**. (Text channel only)'
            },
            slow: {
                value: '<time>',
                info: 'Shortcut for slowmode='
            },
            userlimit: {
                value: '<number>',
                info: 'The maximum of users in the voice channel.'
            },
            users: {
                value: '<number>',
                info: 'Shortcut for --userlimit='
            },
            bitrate: {
                value: '<number>',
                info: 'The bitrate of the voice channel, in kbps.'
            },
            kbps: {
                value: '<number>',
                info: 'Shortcut for --bitrate='
            }
        }
    }
};
