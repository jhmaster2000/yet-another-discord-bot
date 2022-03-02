import Discord, { DiscordAPIError, Message } from 'discord.js';
import Bot from '../Bot.js';
import Utils from '../../utils.js';
import { Args } from '../events/messageCreate.js';

export async function run(client: Bot, message: Message, argsx: Args) {
    const args = argsx.basic.map(arg => arg.raw);
    if (!args[0]) args[0] = message.author.id; 

    let id;
    if (message.mentions.users.first()) id = message.mentions.users.first()!.id;
    else id = args[0];

    let user;
    try {
        user = await client.users.fetch(id);
    } catch(e: unknown) {
        const err = e as DiscordAPIError;
        if (err.code === 10013) return message.channel.send(`${client.em.xmark} User does not exist.`);
        else return message.channel.send(`${client.em.xmark} That is not a valid user ID or mention.`);
    }

    let bot = '';
    if (user.bot) bot = 'https://cdn.discordapp.com/emojis/856855630727348246.png?v=1';

    let badges = [];
    if (user.flags) {
        const flags = user.flags.serialize();
        if (flags.DISCORD_CERTIFIED_MODERATOR) badges.push(client.em.discord_mod);
        if (flags.DISCORD_EMPLOYEE) badges.push(client.em.discord_staff);
        if (flags.PARTNERED_SERVER_OWNER) badges.push(client.em.partner_owner);
        if (flags.EARLY_VERIFIED_BOT_DEVELOPER) badges.push(client.em.bot_dev);
        if (flags.EARLY_SUPPORTER) badges.push(client.em.early_supporter);
        if (flags.HYPESQUAD_EVENTS) badges.push(client.em.hs_events);
        if (flags.HOUSE_BRAVERY) badges.push(client.em.hs_bravery);
        if (flags.HOUSE_BALANCE) badges.push(client.em.hs_balance);
        if (flags.HOUSE_BRILLIANCE) badges.push(client.em.hs_brilliance);
        if (flags.BUGHUNTER_LEVEL_1) badges.push(client.em.bughunter);
        if (flags.BUGHUNTER_LEVEL_2) badges.push(client.em.goldbughunter);
        if (flags.VERIFIED_BOT) badges.push(client.em.verified);
        // TODO: flags.BOT_HTTP_INTERACTIONS
        // TODO: flags.TEAM_USER
    }

    let userdata = [];
    userdata.push(`**User Tag:** \`\`${Utils.escapeBacktick(user.tag, true)}\`\``);
    userdata.push(`**Badges:** ${badges.length ? badges.join(' ') : 'None'}`);

    const userEmbed = new Discord.MessageEmbed()
        .setColor(0x00FF00)
        .setAuthor({ name: `Info for account ${user.id}`, iconURL: bot ? bot : undefined })
        .setDescription(userdata.join('\n'))
        .setThumbnail(user.displayAvatarURL({ dynamic: true, format: 'png' }))
        .setFooter({ text: `Registered on: ${user.createdAt.toUTCString()}` });
    return message.channel.send({ embeds: [userEmbed] });
}

export const config = {
    aliases: ['ulookup', 'lookupuser', 'accountinfo', 'accinfo', 'whois'],
    selfperms: ['EMBED_LINKS'],
    description: 'Checks if a user ID exists and displays basic info about the user if so.',
    usage: {
        args: '[@user | user_id]'
    }
}
