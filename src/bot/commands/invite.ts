import Discord, { Message } from 'discord.js';
import Utils from '../../utils.js';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

const cdnurl = 'https://cdn.discordapp.com/' as const;
const cdn = {
    icon: (guild: any, id: any) => { return `${cdnurl}icons/${guild}/${id}.png?size=4096` },
    banner: (guild: any, id: any) => { return `${cdnurl}banners/${guild}/${id}.png?size=4096` },
    splash: (guild: any, id: any) => { return `${cdnurl}splashes/${guild}/${id}.png?size=4096` }
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
        const inviteEmbed = new Discord.MessageEmbed()
            .setColor(3092790)
            .setThumbnail(cdn.icon(inv.guild!.id, inv.guild!.icon))
            .setTitle(`${partnerBadge}${verifiedBadge}${boostBadge}Invite to: ${Utils.escapeMarkdown(inv.guild!.name)} (Click to join)`)
            .setURL(`https://discord.gg/${inv.code}`)
            .addField('Code', `\`${inv.code}\``, true)
            .addField('Channel', `**\`#${inv.channel.name}\`**`, true)
            .addField('Verification Level', `\`${inv.guild!.verificationLevel.replace(/_/g, ' ')}\``, true)
            .addField('Inviter', `\`${inviter}\``, true)
            .addField('Members', `${client.em.offline} **\`${inv.memberCount}\`**`, true)
            .addField('Online', `${client.em.online} **\`${inv.presenceCount}\`**`, true)
            .addField('Vanity', `${isVanity ? client.em.check : (hasVanity ? `[discord.gg/${inv.guild!.vanityURLCode}](https://discord.gg/${inv.guild!.vanityURLCode})` : client.em.xmark)}`, true)
            .addField('Community', `${isCommunity ? client.em.check : client.em.xmark}`, true)
            .addField('Discoverable', `${isDiscoverable ? client.em.check : client.em.xmark}`, true);
        if (inviteImage !== null)
            inviteEmbed.setImage(cdn[inviteImageType!](inv.guild!.id, inviteImage));
        if (inv.guild!.description)
            inviteEmbed.setDescription(inv.guild!.description);
        return await message.channel.send({ embeds: [inviteEmbed] });
    } catch (err) {
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
