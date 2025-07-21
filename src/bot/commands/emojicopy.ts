import { DiscordAPIError, GuildPremiumTier, GuildPreviewEmoji, Message, type GuildEmojiCreateOptions, type PermissionsString } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

const GuildEmojiLimits: Readonly<Record<GuildPremiumTier, number>> = {
    [GuildPremiumTier.None]:   50, //  50 static /  50 animated (100 total)
    [GuildPremiumTier.Tier1]: 100, // 100 static / 100 animated (200 total)
    [GuildPremiumTier.Tier2]: 150, // 150 static / 150 animated (300 total)
    [GuildPremiumTier.Tier3]: 250, // 250 static / 250 animated (500 total)
};

export async function run(client: Bot<true>, message: Message<true>, args: Args) {
    const argsr = args.basic.map(arg => arg.raw);
    const sourceServerResolvable = argsr[0];
    if (!sourceServerResolvable) {
        return message.channel.send(`${client.em.xmark} Please provide a source server ID or invite link.`);
    }
    let sourceServerID: string | null = sourceServerResolvable.match(/^\d{17,20}$/) ? sourceServerResolvable : null;

    if (!sourceServerID) {
        const possibleInvite = await client.fetchInvite(sourceServerResolvable).catch(() => null);
        if (possibleInvite?.guild) {
            sourceServerID = possibleInvite.guild.id;
        } else {
            return message.channel.send(`${client.em.xmark} Invalid source server ID or invite link.`);
        }
    }
    const targetGuild = message.guild;
    const sourceGuild = await client.fetchGuildPreview(sourceServerID).catch(() => null);
    if (!sourceGuild) {
        return message.channel.send(`${client.em.xmark} Could not fetch the source server. Please ensure the bot is a member or the server is discoverable.`);
    }
    if (sourceGuild.id === targetGuild.id) {
        return message.channel.send(`${client.em.xmark} What did you expect would happen trying to do this?`);
    }
    if (sourceGuild.emojis.size === 0) {
        return message.channel.send(`${client.em.xmark} The source server \`${sourceGuild.name}\` has no custom emojis to copy.`);
    }
    const TARGET_MAX_EMOJIS = GuildEmojiLimits[targetGuild.premiumTier];

    if (sourceGuild.emojis.size > TARGET_MAX_EMOJIS * 2) {
        return message.channel.send(
            `${client.em.xmark} Impossible operation. The source server \`${sourceGuild.name}\` has \`${sourceGuild.emojis.size}\` emojis, ` +
            `which exceeds the current server's total limit of \`${TARGET_MAX_EMOJIS * 2}\` emojis __even if all slots were free__.`
        );
    }

    const sourceGuildAnimEmojiCount = sourceGuild.emojis.filter(e => e.animated).size;
    const sourceGuildStaticEmojiCount = sourceGuild.emojis.size - sourceGuildAnimEmojiCount;

    const targetGuildAnimEmojiCount = targetGuild.emojis.cache.filter(e => e.animated).size;
    const targetGuildStaticEmojiCount = targetGuild.emojis.cache.size - targetGuildAnimEmojiCount;
    const targetGuildFreeAnimEmojiSlots = TARGET_MAX_EMOJIS - targetGuildAnimEmojiCount;
    const targetGuildFreeStaticEmojiSlots = TARGET_MAX_EMOJIS - targetGuildStaticEmojiCount;

    if (sourceGuildAnimEmojiCount > targetGuildFreeAnimEmojiSlots) {
        return message.channel.send(
            `${client.em.xmark} **The current server has insufficient free __animated__ emoji slots to copy all emojis from the source server (\`${sourceGuild.name}\`).**\n` +
            `⬇ Incoming emojis: \`${sourceGuildAnimEmojiCount}\` | 💾 Free slots: \`${targetGuildFreeAnimEmojiSlots}\` | ` +
            `🔻 Missing slots: \`${targetGuildFreeAnimEmojiSlots - sourceGuildAnimEmojiCount}\``
        );
    }
    if (sourceGuildStaticEmojiCount > targetGuildFreeStaticEmojiSlots) {
        return message.channel.send(
            `${client.em.xmark} **The current server has insufficient free __static__ emoji slots to copy all emojis from the source server (\`${sourceGuild.name}\`).**\n` +
            `⬇ Incoming emojis: \`${sourceGuildStaticEmojiCount}\` | 💾 Free slots: \`${targetGuildFreeStaticEmojiSlots}\` | ` +
            `🔻 Missing slots: \`${targetGuildFreeStaticEmojiSlots - sourceGuildStaticEmojiCount}\``
        );
    }
    const emojisToCopy: (GuildEmojiCreateOptions & { _ref: GuildPreviewEmoji })[] = sourceGuild.emojis.map(emoji => ({
        attachment: emoji.imageURL({ size: 4096 }),
        name: emoji.name!, // TODO: this assertion will be unnecessary once Discord.js v15 is out
        reason: `Imported from server "${sourceGuild.name}" by user: ${message.author.tag}`,
        _ref: emoji,
    }));
    let copiedCount = 0;

    const msg = await message.channel.send(
        `${client.em.loadingslow} Copying ${emojisToCopy.length} emojis from \`${sourceGuild.name}\` to \`${targetGuild.name}\`...\n` +
        `**0%** ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛ (${copiedCount}/${emojisToCopy.length})\n` +
        `-# Current emoji: ${emojisToCopy[0]._ref.toString()} \`${emojisToCopy[0]._ref.name!}\``
    );
    const updateProgress = () => {
        copiedCount++;
        const copiedPercentage = (copiedCount / emojisToCopy.length) * 100;
        const progressBar = '🟩'.repeat(Math.floor(copiedPercentage / 10)) + '⬛'.repeat(10 - Math.floor(copiedPercentage / 10));
        return msg.edit(
            `${client.em.loadingslow} Copying ${emojisToCopy.length} emojis from \`${sourceGuild.name}\` to \`${targetGuild.name}\`...\n` +
            `**${copiedPercentage.toFixed(0)}%** ${progressBar} (${copiedCount}/${emojisToCopy.length})\n` +
            `-# Current emoji: ${emojisToCopy[copiedCount]._ref.toString()} \`${emojisToCopy[copiedCount]._ref.name!}\``
        );
    };

    for (const emoji of emojisToCopy) {
        const newEmoji = await targetGuild.emojis.create(emoji).catch((e) => e as DiscordAPIError);
        if (newEmoji instanceof Error) {
            return msg.edit(
                `${client.em.xmark} A fatal error occured during the emoji copy operation and it cannot continue.\n` +
                `While copying emoji: ${emoji._ref.toString()} (from: \`${sourceGuild.name}\`)\nError: ${newEmoji.message ?? 'Unknown error'}`
            );
        }
        await updateProgress();
    }
    return msg.edit(
        `${client.em.check} Successfully copied **${copiedCount}** emojis from \`${sourceGuild.name}\`.\n` +
        `**100%** 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩 (${copiedCount}/${emojisToCopy.length})`
    );
}

export const config = {
    aliases: ['copyemoji', 'copyemojis'],
    userperms: ['ManageEmojisAndStickers', 'Administrator'] satisfies PermissionsString[],
    selfperms: ['ManageEmojisAndStickers'] satisfies PermissionsString[],
    description:
        'Copy all custom emojis from a source server to the current server.\n' +
        '__The bot must be a member of the source server, or it must be discoverable.__',
    usage: {
        args: '<source_server_id_or_invite>',
    }
};
