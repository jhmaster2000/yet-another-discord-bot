import { type ColorResolvable, Message, type RoleCreateOptions } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

function upCaseFirst(str: string) {
    return str[0].toUpperCase() + str.slice(1);
}

export async function run(client: Bot, message: Message, args: Args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} Please provide a name for the role.`);
    const argsr = args.ordered.map(arg => arg.raw);

    const roledata: RoleCreateOptions = {
        name: argsr.join(' '),
        reason: `Requested by user: ${message.author.tag}`,
        color: upCaseFirst(args.options.get('color')?.toLowerCase() ?? 'Default') as ColorResolvable,
        hoist: args.flags.has('hoisted') || args.flags.has('hoist'),
        mentionable: args.flags.has('mentionable') || args.flags.has('mention') || args.flags.has('ping'),
    };
    const hoisted = roledata.hoist ? client.em.check : client.em.xmark;
    const mention = roledata.mentionable ? client.em.check : client.em.xmark;

    try {
        const role = await message.guild!.roles.create(roledata);
        return await message.channel.send(`${client.em.check} Successfully created role ${role.toString()} (\`Hoisted?\` ${hoisted} | \`Mentionable?\` ${mention})`);
    } catch (e) {
        return await message.channel.send(`${client.em.xmark} Role name is too long. (\`${roledata.name?.length ?? -1}\` characters out of \`100\` maximum)`).then(void console.error(e));
    }
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
