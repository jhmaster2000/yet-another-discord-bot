import { Message } from 'discord.js';
import Bot from '../Bot.js';
import { Args } from '../events/message.js';

export function run(client: Bot, message: Message, args: Args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} Please provide a name for the role.`);
    const argsr = args.ordered.map(arg => arg.raw);

    const roledata = {
        name: argsr.join(' '),
        color: args.options.get('color')?.toUpperCase() || 'DEFAULT',
        hoist: args.flags.has('hoisted') || args.flags.has('hoist'),
        mentionable: args.flags.has('mentionable') || args.flags.has('mention') || args.flags.has('ping')
    }
    const hoisted = roledata.hoist ? client.em.check : client.em.xmark;
    const mention = roledata.mentionable ? client.em.check : client.em.xmark;

    message.guild!.roles.create({
        data: roledata,
        reason: `Requested by user: ${message.author.tag}`
    })
    .then(role => message.channel.send(`${client.em.check} Successfully created role ${role.toString()} (\`Hoisted?\` ${hoisted} | \`Mentionable?\` ${mention})`))
    .catch(e => message.channel.send(`${client.em.xmark} Role name is too long. (\`${roledata.name.length}\` characters out of \`100\` maximum)`).then(<any>console.error(e)));
}

export const config = {
    aliases: ['addrole', 'createrole', 'makerole'],
    selfperms: ['MANAGE_ROLES'],
    userperms: ['MANAGE_ROLES'],
    description: 'Creates a new role in the server.',
    usage: {
        args: '<...role_name>',
        flags: {
            hoisted: 'Display role members separately on member list.',
            mentionable: 'Make role mentionable by everyone.'
        },
        options: {
            color: {
                value: '<color_code>',
                info: 'A color, either hex code (#ff0000) or a color name (red).'
            }
        }
    }
};
