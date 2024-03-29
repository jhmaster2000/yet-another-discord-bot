import Discord, { Message } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, args: Args) {
    let rolesData: string[] = [];
    let rolesList = message.guild!.roles.cache.sort((roleA, roleB) => roleB.position - roleA.position);
    rolesList.forEach(role => rolesData.push(`${role.toString()} (${role.members.size} members)`));

    if (rolesData.join('\n').length > 2048) return simpleRoles(rolesList, message);
    const rolesEmbed = new Discord.EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(`Roles in this server: (${rolesData.length})`)
        .setDescription(rolesData.join('\n'));
    return message.channel.send({ embeds: [rolesEmbed] });
}

function simpleRoles(rolesList: Discord.Collection<string, Discord.Role>, message: Message) {
    let simpleRolesData: Discord.Role[] = [];
    rolesList.forEach(role => simpleRolesData.push(role));

    if (simpleRolesData.join(', ').length > 2048) return tooManyRoles(simpleRolesData.length, message);
    const simpleRolesEmbed = new Discord.EmbedBuilder()
        .setColor(0xFFFF00)
        .setTitle(`Roles in this server: (${simpleRolesData.length})`)
        .setDescription(simpleRolesData.join(', '))
        .setFooter({ text: '⚠️ This server has too many roles to display full roles data.' });
    return message.channel.send({ embeds: [simpleRolesEmbed] });
}

function tooManyRoles(rolesCount: number, message: Discord.Message): Promise<Discord.Message> {
    const tooManyRolesEmbed = new Discord.EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`Roles in this server: (${rolesCount})`)
        .setFooter({ text: '❌ This server has too many roles to display.' });
    return message.channel.send({ embeds: [tooManyRolesEmbed] });
}

export const config = {
    aliases: ['serverroles', 'roleslist', 'listroles', 'allroles', 'guildroles'],
    selfperms: ['EMBED_LINKS'],
    description: 'Lists all roles in the server.'
}
