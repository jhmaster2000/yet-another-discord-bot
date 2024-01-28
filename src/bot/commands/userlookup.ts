import Discord, { DiscordAPIError, Message } from 'discord.js';
import Bot from '../Bot.js';
import Utils from '../../utils.js';
import { type Args } from '../events/messageCreate.js';

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
        if (flags.CertifiedModerator) badges.push(client.em.discord_mod);
        if (flags.Staff) badges.push(client.em.discord_staff);
        if (flags.Partner) badges.push(client.em.partner_owner);
        if (flags.VerifiedDeveloper) badges.push(client.em.bot_dev);
        if (flags.PremiumEarlySupporter) badges.push(client.em.early_supporter);
        if (flags.Hypesquad) badges.push(client.em.hs_events);
        if (flags.HypeSquadOnlineHouse1) badges.push(client.em.hs_bravery);
        if (flags.HypeSquadOnlineHouse2) badges.push(client.em.hs_brilliance);
        if (flags.HypeSquadOnlineHouse3) badges.push(client.em.hs_balance);
        if (flags.BugHunterLevel1) badges.push(client.em.bughunter);
        if (flags.BugHunterLevel2) badges.push(client.em.goldbughunter);
        if (flags.VerifiedBot) badges.push(client.em.verified);
        // TODO: flags.BOT_HTTP_INTERACTIONS
        // TODO: flags.TEAM_USER
    }

    let userdata = [];
    userdata.push(`**User Tag:** \`\`${Utils.escapeBacktick(user.tag, true)}\`\``);
    userdata.push(`**Badges:** ${badges.length ? badges.join(' ') : 'None'}`);

    const userEmbed = new Discord.EmbedBuilder()
        .setColor(0x00FF00)
        .setAuthor({ name: `Info for account ${user.id}`, iconURL: bot ? bot : undefined })
        .setDescription(userdata.join('\n'))
        .setThumbnail(user.displayAvatarURL({ extension: 'png' }))
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
