import Discord, { ChannelType, GuildVerificationLevel, Message } from 'discord.js';
import Utils from '../../utils.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export async function run(client: Bot, message: Message, args: Args) {
    const guild = message.guild!;
    await guild.members.fetch();
    const isDiscoverable = guild.features.includes('DISCOVERABLE');
    const isCommunity = guild.features.includes('COMMUNITY');
    const verifiedBadge = guild.verified ? client.em.verified + ' ' : '';
    const partnerBadge = guild.partnered ? client.em.partner + ' ' : '';
    let boostBadge = '';
    if (guild.premiumTier === Discord.GuildPremiumTier.None && guild.premiumSubscriptionCount !== 0) boostBadge = client.em.boost0 + ' ';
    if (guild.premiumTier === Discord.GuildPremiumTier.Tier1) boostBadge = client.em.boost1 + ' ';
    if (guild.premiumTier === Discord.GuildPremiumTier.Tier2) boostBadge = client.em.boost2 + ' ';
    if (guild.premiumTier === Discord.GuildPremiumTier.Tier3) boostBadge = client.em.boost3 + ' ';
    if (verifiedBadge || partnerBadge) boostBadge = '';

    const serverEmbed = new Discord.EmbedBuilder()
        .setColor(0x27D11A)
        .setTitle(`${partnerBadge}${verifiedBadge}${boostBadge}Server info for ${Utils.escapeMarkdown(guild.name)}`)
        .addFields(
            { name: `${client.em.owner} Owner`, value: `\`\`${Utils.escapeBacktick((await guild.fetchOwner()).user.tag, true)}\`\`\t\u200B`, inline: true },
            { name: '📝 Acronym', value: `\`\`${Utils.escapeBacktick(guild.nameAcronym)}\`\``, inline: true },
            { name: `${client.em.verification} Verify Level`, value: `\`${GuildVerificationLevel[guild.verificationLevel].replace(/_/g, ' ')}\``, inline: true },
            { name: `${client.em.members} Members: \`${guild.members.cache.size}\``, value: `<:online:819698342690291752>\`${guild.members.cache.filter(m => m.presence?.status === 'online').size}\` <:idle:819698386465849414>\`${guild.members.cache.filter(m => m.presence?.status === 'idle').size}\`\n<:offline:819698482415140874>\`${guild.members.cache.filter(m => !m.presence?.status).size}\` <:dnd:819698439189299221>\`${guild.members.cache.filter(m => m.presence?.status === 'dnd').size}\``, inline: true },
            { name: `${client.em.channels} Channels: \`${guild.channels.cache.filter(c => c.type !== ChannelType.GuildCategory).size}\``, value: `${client.em.textchannel} Text: \`${guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size}\`\n${client.em.voicechannel} Voice: \`${guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size}\``, inline: true },
            { name: `${client.em.settings} Features:`, value: `${isCommunity ? client.em.check : client.em.xmark} Community\n${isDiscoverable ? client.em.check : client.em.xmark} Discovery`, inline: true },
            { name: `${client.em.roles} Roles: \`${guild.roles.cache.size}\``, value: '\u200B', inline: true },
            { name: `${client.em.emojis} Emojis: \`${guild.emojis.cache.size}\``, value: '\u200B', inline: true },
            { name: `${client.em.boost} Boosts: \`${guild.premiumSubscriptionCount ?? '???'}\``, value: '\u200B', inline: true },
        )
        .setThumbnail(guild.iconURL())
        .setFooter({ text: `Server ID: ${guild.id} • Created on: ${guild.createdAt.toUTCString()}`, iconURL: message.author.displayAvatarURL({ extension: 'png' }) });
    if (guild.description) serverEmbed.setDescription(guild.description);
    return message.channel.send({ embeds: [serverEmbed] });
}

export const config = {
    aliases: ['sinfo', 'svinfo', 'srvinfo', 'guildinfo', 'ginfo'],
    selfperms: ['EMBED_LINKS'],
    description: 'Displays information about the current server.'
}
