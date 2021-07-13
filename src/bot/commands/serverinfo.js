import Discord from 'discord.js';

export function run(client, message, args) {
    const guild = message.guild;
    guild.members.fetch();
    const isDiscoverable = guild.features.includes('DISCOVERABLE');
    const isCommunity = guild.features.includes('COMMUNITY');
    const verifiedBadge = guild.verified ? client.em.verified + ' ' : '';
    const partnerBadge = guild.partnered ? client.em.partner + ' ' : '';
    let boostBadge = '';
    if (guild.premiumTier === 0 && guild.premiumSubscriptionCount !== 0) boostBadge = client.em.boost0 + ' ';
    if (guild.premiumTier === 1) boostBadge = client.em.boost1 + ' ';
    if (guild.premiumTier === 2) boostBadge = client.em.boost2 + ' ';
    if (guild.premiumTier >= 3) boostBadge = client.em.boost3 + ' ';
    if (verifiedBadge || partnerBadge) boostBadge = '';

    const serverEmbed = new Discord.MessageEmbed()
        .setColor(0x27d11a)
        .setTitle(`${partnerBadge}${verifiedBadge}${boostBadge}Server info for ${RegExp.escapeMarkdown(guild.name)}`)
        .addField(`${client.em.owner} Owner`, `\`\`${RegExp.escapeBacktick(guild.owner.user.tag)}\`\`\t​`, true)
        .addField('🌎 Region', `\`${guild.region}\``, true)
        .addField(`${client.em.verification} Verify Level`, `\`${guild.verificationLevel.replace(/_/g, ' ')}\``, true)
        .addField(`${client.em.members} Members: \`${guild.members.cache.size}\``, `<:online:819698342690291752>\`${guild.members.cache.filter(m => m.user.presence.status === 'online').size}\` <:idle:819698386465849414>\`${guild.members.cache.filter(m => m.user.presence.status === 'idle').size}\`\n<:offline:819698482415140874>\`${guild.members.cache.filter(m => m.user.presence.status === 'offline').size}\` <:dnd:819698439189299221>\`${guild.members.cache.filter(m => m.user.presence.status === 'dnd').size}\``, true)
        .addField(`${client.em.channels} Channels: \`${guild.channels.cache.filter(c => c.type !== 'category').size}\``, `${client.em.textchannel} Text: \`${guild.channels.cache.filter(c => c.type === 'text').size}\`\n${client.em.voicechannel} Voice: \`${guild.channels.cache.filter(c => c.type === 'voice').size}\``, true)
        .addField(`${client.em.settings} Features:`, `${isCommunity ? client.em.check : client.em.xmark} Community\n${isDiscoverable ? client.em.check : client.em.xmark} Discovery`, true)
        .addField(`${client.em.roles} Roles: \`${guild.roles.cache.size}\``, '​', true)
        .addField(`${client.em.emojis} Emojis: \`${guild.emojis.cache.size}\``, '​', true)
        .addField(`${client.em.boost} Boosts: \`${guild.premiumSubscriptionCount}\``, '​', true)
        .setThumbnail(guild.iconURL())
        .setFooter(`Server ID: ${guild.id} • Created on: ${guild.createdAt.toUTCString()}`, message.author.displayAvatarURL({ dynamic: true, format: 'png' }));
    if (guild.description) serverEmbed.setDescription(guild.description);
    return message.channel.send(serverEmbed);
}

export const config = {
    aliases: ['sinfo', 'svinfo', 'srvinfo', 'guildinfo', 'ginfo'],
    selfperms: ['EMBED_LINKS'],
    description: 'Displays information about the current server.'
}