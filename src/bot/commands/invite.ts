import Discord, { GuildVerificationLevel, Message } from 'discord.js';
import Utils from '../../utils.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

const cdnurl = 'https://cdn.discordapp.com/' as const;
const cdn = {
    icon: (guild: string, id: string) => { return `${cdnurl}icons/${guild}/${id}.png?size=4096` },
    banner: (guild: string, id: string) => { return `${cdnurl}banners/${guild}/${id}.png?size=4096` },
    splash: (guild: string, id: string) => { return `${cdnurl}splashes/${guild}/${id}.png?size=4096` }
};

export async function run(client: Bot, message: Message, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`${client.em.xmark} No Discord invite provided.`);
    const args = argsx.basic.map(arg => arg.raw);
    const code = args[0];

    try {
        const inv = await client.fetchInvite(code);
        const hasVanity = Boolean(inv.guild!.vanityURLCode);
        const isVanity = (hasVanity && inv.guild!.vanityURLCode === inv.code);
        const isDiscoverable = inv.guild!.features.includes('DISCOVERABLE');
        const isCommunity = inv.guild!.features.includes('COMMUNITY');
        const verifiedBadge = inv.guild!.verified ? client.em.verified + ' ' : '';
        const partnerBadge = inv.guild!.partnered ? client.em.partner + ' ' : '';
        let boostBadge = '';
        if (inv.guild!.features.includes('ANIMATED_ICON')) boostBadge = client.em.boost1 + ' ';
        if (inv.guild!.features.includes('BANNER'))        boostBadge = client.em.boost2 + ' ';
        if (inv.guild!.features.includes('VANITY_URL'))    boostBadge = client.em.boost3 + ' ';
        if (verifiedBadge || partnerBadge)                 boostBadge = '';
        const inviter = inv.inviter?.tag || (isVanity ? 'System' : 'Unknown');
        const inviteImage = inv.guild!.splash || inv.guild!.banner || null;
        const inviteImageType = inv.guild!.splash ? 'splash' : (inv.guild!.banner ? 'banner' : null);
        const inviteEmbed = new Discord.EmbedBuilder()
            .setColor(3092790)
            .setThumbnail(cdn.icon(inv.guild!.id, inv.guild!.icon!))
            .setTitle(`${partnerBadge}${verifiedBadge}${boostBadge}Invite to: ${Utils.escapeMarkdown(inv.guild!.name)} (Click to join)`)
            .setURL(`https://discord.gg/${inv.code}`)
            .addFields(
                { name: 'Code', value: `\`${inv.code}\``, inline: true },
                { name: 'Channel', value: `**\`#${inv.channel?.name ?? 'Unknown (?)'}\`**`, inline: true },
                { name: 'Verification Level', value: `\`${GuildVerificationLevel[inv.guild!.verificationLevel].replace(/_/g, ' ')}\``, inline: true },
                { name: 'Inviter', value: `\`${inviter}\``, inline: true },
                { name: 'Members', value: `${client.em.offline} **\`${inv.memberCount}\`**`, inline: true },
                { name: 'Online', value: `${client.em.online} **\`${inv.presenceCount}\`**`, inline: true },
                { name: 'Vanity', value: `${isVanity ? client.em.check : (hasVanity ? `[discord.gg/${inv.guild!.vanityURLCode!}](https://discord.gg/${inv.guild!.vanityURLCode!})` : client.em.xmark)}`, inline: true },
                { name: 'Community', value: `${isCommunity ? client.em.check : client.em.xmark}`, inline: true },
                { name: 'Discoverable', value: `${isDiscoverable ? client.em.check : client.em.xmark}`, inline: true },
            );
        if (inviteImage !== null)
            inviteEmbed.setImage(cdn[inviteImageType!](inv.guild!.id, inviteImage));
        if (inv.guild!.description)
            inviteEmbed.setDescription(inv.guild!.description);
        return await message.channel.send({ embeds: [inviteEmbed] });
    } catch {
        return await message.channel.send(`${client.em.xmark} Invalid Discord invite link!`);
    }
}

export const config = {
    aliases: ['inv', 'invinfo', 'inviteinfo'],
    selfperms: ['EMBED_LINKS'],
    description: 'Gets information on a Discord invite link/code.',
    usage: {
        args: '<discord_invite>'
    }
};
