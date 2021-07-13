import Discord from 'discord.js';

export function run(client, message, args) {
    let rolesData = [];
    let rolesList = message.guild.roles.cache.sort((roleA, roleB) => roleB.position - roleA.position);
    rolesList.forEach(role => rolesData.push(`${role} (${role.members.size} members)`));

    if (rolesData.join('\n').length > 2048) return simpleRoles(rolesList, message);
    const rolesEmbed = new Discord.MessageEmbed()
        .setColor(0x00FF00)
        .setTitle(`Roles in this server: (${rolesData.length})`)
        .setDescription(rolesData.join('\n'));
    return message.channel.send(rolesEmbed);
}

function simpleRoles(rolesList, message) {
    let simpleRolesData = [];
    rolesList.forEach(role => simpleRolesData.push(role));

    if (simpleRolesData.join(', ').length > 2048) return tooManyRoles(simpleRolesData.length, message);
    const simpleRolesEmbed = new Discord.MessageEmbed()
        .setColor(0xFFFF00)
        .setTitle(`Roles in this server: (${simpleRolesData.length})`)
        .setDescription(simpleRolesData.join(', '))
        .setFooter('⚠️ This server has too many roles to display full roles data.');
    return message.channel.send(simpleRolesEmbed);
}

function tooManyRoles(rolesCount, message) {
    const tooManyRolesEmbed = new Discord.MessageEmbed()
        .setColor(0xFF0000)
        .setTitle(`Roles in this server: (${rolesCount})`)
        .setFooter('❌ This server has too many roles to display.');
    return message.channel.send(tooManyRolesEmbed);
}

export const config = {
    aliases: ['serverroles', 'roleslist', 'listroles', 'allroles', 'guildroles'],
    selfperms: ['EMBED_LINKS'],
    description: 'Lists all roles in the server.'
}