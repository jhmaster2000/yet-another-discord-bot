import { Message, Role } from 'discord.js';
import Utils from '../../utils.js';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export async function run(client: Bot, message: Message, args: Args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} Please provide a mention or ID of at least one role.`);
    message.guild!.roles.fetch();

    const argsr = args.ordered.map(arg => arg.raw);
    const roles = message.mentions.roles;

    let invalidRoles: string[] = [];
    argsr.forEach(possibleRoleID => {
        if (possibleRoleID.trim().match(/^<@&[0-9]{17,20}>$/g)) return;
        const possibleRole = message.guild!.roles.cache.get(possibleRoleID);
        if (!possibleRole) return invalidRoles.push(Utils.escapeBacktick(possibleRoleID, true));
        else return roles.set(possibleRole.id, possibleRole);
    });
    if (!roles.size) return message.channel.send(`${client.em.xmark} Could not resolve any valid roles from your input.`);
    if (roles.size > 5) return message.channel.send(`${client.em.xmark} Only up to **5** roles can be deleted at once.`);

    let issues = [];
    let s = invalidRoles.length === 1 ? '' : 's';
    if (invalidRoles.length) issues.push(`⚠️ Failed to resolve **${invalidRoles.length}** argument${s} into valid roles:\n\`\`${invalidRoles.join('``, ``')}\`\``);

    let notEditableBySelf: Role[] = [];
    roles.filter(role => !role.editable).forEach(role => {
        notEditableBySelf.push(role);
        roles.delete(role.id);
    });
    s = notEditableBySelf.length === 1 ? '' : 's';
    if (notEditableBySelf.length) issues.push(`⚠️ Unable to delete the **${notEditableBySelf.length}** role${s} listed below because they are above or equal to the bot's highest role, or are protected by Discord:\n${notEditableBySelf.join(' | ')}`);
    
    if ((await message.guild!.fetchOwner()).id !== message.author.id) {
        let notEditableByUser: Role[] = [];
        roles.filter(role => message.member!.roles.highest.comparePositionTo(role) <= 0).forEach(role => {
            notEditableByUser.push(role);
            roles.delete(role.id);
        });
        s = notEditableByUser.length === 1 ? '' : 's';
        if (notEditableByUser.length) issues.push(`⚠️ Refusing to delete the **${notEditableByUser.length}** role${s} listed below because they are above or equal to your highest role:\n${notEditableByUser.join(' | ')}`);
    }

    if (!roles.size) return message.channel.send(issues.join('\n'));
    s = roles.size === 1 ? '' : 's';
    const msg = await message.channel.send(`${issues.join('\n')}\n\n⁉️ Are you sure you want to __permanently__ delete the **${roles.size}** role${s} listed below?\n${roles.map(r => r).join(' | ')}`);
    return client.promptYesNo(message.author, msg, (answer) => {
        msg.reactions.removeAll();
        const timedout = answer === null ? '(Timed out)' : '';
        if (!answer)
            return msg.edit(`${client.em.neutral} Cancelled deletion of **${roles.size}** role${s}. ${timedout}`);

        roles.forEach(role_5 => role_5.delete(`Requested by user: ${message.author.tag}`));
        return msg.edit(`${client.em.check} Successfully deleted **${roles.size}** role${s}: \`\`${roles.map(r_1 => r_1.name).join('``, ``')}\`\``);
    });
}

export const config = {
    aliases: ['deleterole', 'deleteroles', 'delroles'],
    userperms: ['MANAGE_ROLES'],
    selfperms: ['MANAGE_ROLES', 'ADD_REACTIONS'],
    description: 'Deletes between 1 to 5 server roles.',
    usage: {
        args: '<...@role | ...role_id>'
    }
}
