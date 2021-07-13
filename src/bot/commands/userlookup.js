import Discord from 'discord.js';

export async function run(client, message, args) {
    args = await args.basic.map(arg => arg.raw);
    if (!await args[0]) args[0] = await message.author.id; 

    let id;
    if (await message.mentions.users.first()) id = await message.mentions.users.first().id;
    else id = await args[0];

    let user;
    try {
        user = await client.users.fetch(id);
    } catch(err) {
        if (err.code === 10013) return message.channel.send(`${client.em.xmark} User does not exist.`);
        else return message.channel.send(`${client.em.xmark} That is not a valid user ID or mention.`);
    }

    let bot = false;
    if (await user.bot) bot = 'https://cdn.discordapp.com/emojis/856855630727348246.png?v=1';

    let badges = [];
    if (await user.flags) {
        const flags = await user.flags.serialize();
        flags.DISCORD_CERTIFIED_MODERATOR = await user.flags.has(1 << 18);
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

    let userdata = [];
    userdata.push(`**User Tag:** \`\`${await RegExp.escapeBacktick(await user.tag)}\`\``);
    userdata.push(`**Badges:** ${badges.length ? badges.join(' ') : 'None'}`);

    const userEmbed = new Discord.MessageEmbed()
        .setColor(0x00FF00)
        .setAuthor(`Info for account ${await user.id}`, bot ? bot : undefined)
        .setDescription(userdata.join('\n'))
        .setThumbnail(await user.displayAvatarURL({ dynamic: true, format: 'png' }))
        .setFooter(`Registered on: ${await user.createdAt.toUTCString()}`);
    return message.channel.send(userEmbed);
}

export const config = {
    aliases: ['ulookup', 'lookupuser', 'accountinfo', 'accinfo', 'whois'],
    selfperms: ['EMBED_LINKS'],
    description: 'Checks if a user ID exists and displays basic info about the user if so.',
    usage: {
        args: '[@user | user_id]'
    }
}