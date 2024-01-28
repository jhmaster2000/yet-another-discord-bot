import Discord, { Message } from 'discord.js';
import Utils from '../../utils.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, args: Args) {
    void message.guild!.members.fetch();
    const pagesCount = message.guild!.members.cache.size;
    let members: Discord.EmbedBuilder[] = [];

    message.guild!.members.cache.forEach(member => {
        let badges = [];
        if (member.user.bot) badges.push(client.em.bot);
        if (member.premiumSince) badges.push(client.em.booster);
        if (member.user.flags) {
            const flags = member.user.flags.serialize();
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
        const badgesStr = badges.length ? badges.join(' ') + ' ' : '';

        let nickname = member.displayName;
        if (nickname === member.user.username) nickname = '';

        const memberEmbed = new Discord.EmbedBuilder()
            .setColor(member.displayHexColor)
            .setTitle(`${badgesStr}${Utils.escapeMarkdown(member.user.tag)}`)
            .addFields(
                { name: 'Roles', value: member.roles.cache.sort((roleA, roleB) => roleB.position - roleA.position).map(role => role).join(', ') },
                { name: 'Permissions', value: `\`${member.permissions.toArray().join('`, `')}\`` },
                { name: 'Joined on', value: `${member.joinedAt!.toUTCString()}`, inline: true },
                { name: 'Registered on', value: `${member.user.createdAt.toUTCString()}`, inline: true },
            )
            .setThumbnail(member.user.displayAvatarURL({ extension: 'png' }));
        if (nickname) memberEmbed.setTitle(`${badgesStr}${Utils.escapeMarkdown(member.user.tag)} (__AKA:__ ${nickname})`);
        members.push(memberEmbed);
    });

    client.paginate(message, members, pagesCount, 30000);
}

export const config = {
    aliases: ['servermembers', 'guildmembers', 'gmembers', 'memberlist', 'listmembers'],
    selfperms: ['EMBED_LINKS', 'ADD_REACTIONS'],
    description: 'Displays an interactive list of all members in the server.'
};
