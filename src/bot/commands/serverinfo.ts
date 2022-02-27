import Discord, { Message } from 'discord.js';
import Utils from '../../utils.js';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export async function run(client: Bot, message: Message, args: Args) {
    const guild = message.guild!;
    guild.members.fetch();
    const isDiscoverable = guild.features.includes('DISCOVERABLE');
    const isCommunity = guild.features.includes('COMMUNITY');
    const verifiedBadge = guild.verified ? client.em.verified + ' ' : '';
    const partnerBadge = guild.partnered ? client.em.partner + ' ' : '';
    let boostBadge = '';
    if (guild.premiumTier === 'NONE' && guild.premiumSubscriptionCount !== 0) boostBadge = client.em.boost0 + ' ';
    if (guild.premiumTier === 'TIER_1') boostBadge = client.em.boost1 + ' ';
    if (guild.premiumTier === 'TIER_2') boostBadge = client.em.boost2 + ' ';
    if (guild.premiumTier === 'TIER_3') boostBadge = client.em.boost3 + ' ';
    if (verifiedBadge || partnerBadge) boostBadge = '';

    const serverEmbed = new Discord.MessageEmbed()
        .setColor(0x27D11A)
        .setTitle(`${partnerBadge}${verifiedBadge}${boostBadge}Server info for ${Utils.escapeMarkdown(guild.name)}`)
        .addField(`${client.em.owner} Owner`, `\`\`${Utils.escapeBacktick((await guild.fetchOwner()).user.tag, true)}\`\`\t\u200B`, true)
        .addField('📝 Acronym', `\`\`${Utils.escapeBacktick(guild.nameAcronym)}\`\``, true)
        .addField(`${client.em.verification} Verify Level`, `\`${guild.verificationLevel.replace(/_/g, ' ')}\``, true)
        .addField(`${client.em.members} Members: \`${guild.members.cache.size}\``, `<:online:819698342690291752>\`${guild.members.cache.filter(m => m.presence?.status === 'online').size}\` <:idle:819698386465849414>\`${guild.members.cache.filter(m => m.presence?.status === 'idle').size}\`\n<:offline:819698482415140874>\`${guild.members.cache.filter(m => !m.presence?.status).size}\` <:dnd:819698439189299221>\`${guild.members.cache.filter(m => m.presence?.status === 'dnd').size}\``, true)
        .addField(`${client.em.channels} Channels: \`${guild.channels.cache.filter(c => c.type !== 'GUILD_CATEGORY').size}\``, `${client.em.textchannel} Text: \`${guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').size}\`\n${client.em.voicechannel} Voice: \`${guild.channels.cache.filter(c => c.type === 'GUILD_VOICE').size}\``, true)
        .addField(`${client.em.settings} Features:`, `${isCommunity ? client.em.check : client.em.xmark} Community\n${isDiscoverable ? client.em.check : client.em.xmark} Discovery`, true)
        .addField(`${client.em.roles} Roles: \`${guild.roles.cache.size}\``, '\u200B', true)
        .addField(`${client.em.emojis} Emojis: \`${guild.emojis.cache.size}\``, '\u200B', true)
        .addField(`${client.em.boost} Boosts: \`${guild.premiumSubscriptionCount}\``, '\u200B', true)
        .setThumbnail(guild.iconURL()!)
        .setFooter({ text: `Server ID: ${guild.id} • Created on: ${guild.createdAt.toUTCString()}`, iconURL: message.author.displayAvatarURL({ dynamic: true, format: 'png' }) });
    if (guild.description) serverEmbed.setDescription(guild.description);
    return message.channel.send({ embeds: [serverEmbed] });
}

export const config = {
    aliases: ['sinfo', 'svinfo', 'srvinfo', 'guildinfo', 'ginfo'],
    selfperms: ['EMBED_LINKS'],
    description: 'Displays information about the current server.'
}
