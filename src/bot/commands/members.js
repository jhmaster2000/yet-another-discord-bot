import Discord from 'discord.js';

export function run(client, message, args) {
    message.guild.members.fetch();
    const pagesCount = message.guild.members.cache.size;
    let members = [];

    message.guild.members.cache.forEach(member => {
        let badges = [];
        if (member.user.bot) badges.push(client.em.bot);
        if (member.premiumSince) badges.push(client.em.booster);
        if (member.user.flags) {
            const flags = member.user.flags.serialize();
            flags.DISCORD_CERTIFIED_MODERATOR = member.user.flags.has(1 << 18);
            if (flags.DISCORD_CERTIFIED_MODERATOR) badges.push(client.em.discord_mod);
            if (flags.DISCORD_EMPLOYEE) badges.push(client.em.discord_staff);
            if (flags.DISCORD_PARTNER || flags.PARTNERED_SERVER_OWNER) badges.push(client.em.partner_owner);
            if (flags.VERIFIED_DEVELOPER || flags.EARLY_VERIFIED_BOT_DEVELOPER) badges.push(client.em.bot_dev);
            if (flags.EARLY_SUPPORTER) badges.push(client.em.early_supporter);
            if (flags.HYPESQUAD_EVENTS) badges.push(client.em.hs_events);
            if (flags.HOUSE_BRAVERY) badges.push(client.em.hs_bravery);
            if (flags.HOUSE_BALANCE) badges.push(client.em.hs_balance);
            if (flags.HOUSE_BRILLIANCE) badges.push(client.em.hs_brilliance);
            if (flags.BUGHUNTER_LEVEL_1) badges.push(client.em.bughunter);
            if (flags.BUGHUNTER_LEVEL_2) badges.push(client.em.goldbughunter);
            if (flags.VERIFIED_BOT) badges.push(client.em.verified);
        }
        badges = badges.length ? badges.join(' ') + ' ' : '';

        let nickname = member.displayName;
        if (nickname === member.user.username) nickname = false;

        const memberEmbed = new Discord.MessageEmbed()
            .setColor(member.displayHexColor)
            .setTitle(`${badges}${RegExp.escapeMarkdown(member.user.tag)}`)
            .addField('Roles', member.roles.cache.sort((roleA, roleB) => roleB.position - roleA.position).map(role => role).join(', '))
            .addField('Permissions', `\`${member.permissions.toArray().join('`, `')}\``)
            .addField('Joined on', `${member.joinedAt.toUTCString()}`, true)
            .addField('Registered on', `${member.user.createdAt.toUTCString()}`, true)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }));
        if (nickname) memberEmbed.setTitle(`${badges}${RegExp.escapeMarkdown(member.user.tag)} (__AKA:__ ${nickname})`);
        members.push(memberEmbed);
    });

    client.paginate(message, members, pagesCount, 30000);
}

export const config = {
    aliases: ['servermembers', 'guildmembers', 'gmembers', 'memberlist', 'listmembers'],
    selfperms: ['EMBED_LINKS', 'ADD_REACTIONS'],
    description: 'Displays an interactive list of all members in the server.'
};