import { DiscordAPIError, Message } from 'discord.js';
import Utils from '../../utils.js';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export async function run(client: Bot, message: Message, args: Args) {
    const argsr = args.basic.map(arg => arg.raw);
    
    const hasAttachment = Boolean(message.attachments.first());
    const argOffset = hasAttachment ? 1 : 0;
    
    const name = argsr[0];
    const image = hasAttachment ? message.attachments.first()!.url : argsr[1];
    if (!name) return message.channel.send(`${client.em.xmark} Please provide a name for the emoji.`);
    if (!image) return message.channel.send(`${client.em.xmark} Please provide an image link to be the emoji.`);
    if (!name.match(/^\w{2,32}$/i)) return message.channel.send(`${client.em.xmark} Emoji name must be between \`2\` and \`32\` characters long and **only contain letters, numbers or underscores**.`);

    let rolesInfo = '';
    const roles = message.mentions.roles;
    if (argsr[2 - argOffset] === '--roles' || argsr[2 - argOffset] === '--r') {
        if (!argsr[3 - argOffset]) return message.channel.send(`${client.em.xmark} The \`--roles\` option requires at least **1** role mention or ID.`);
        await message.guild!.roles.fetch();
        let invalidRoles: string[] = [];
        argsr.forEach((possibleRoleID, index) => {
            if (index <= 2 - argOffset) return;
            if (possibleRoleID.trim().match(/^<@&[0-9]{17,20}>$/g)) return;
            const possibleRole = message.guild!.roles.cache.get(possibleRoleID);
            if (!possibleRole) return invalidRoles.push(Utils.escapeBacktick(possibleRoleID, true));
            else return roles.set(possibleRole.id, possibleRole);
        });
        let s = invalidRoles.length === 1 ? '' : 's';
        if (!roles.size) return message.channel.send(`${client.em.xmark} Could not resolve any valid roles from \`--roles\` option.`);
        if (invalidRoles.length) return message.channel.send(`⚠️ Failed to resolve **${invalidRoles.length}** role${s} from \`--roles\` option:\n\`\`${invalidRoles.join('``, ``')}\`\``);
        rolesInfo = `\n🔒 Emoji restricted to these roles: ${roles.map(r => r).join(', ')}`;
    }
    if (argsr[2 - argOffset] !== '--roles' && argsr[2 - argOffset] !== '--r') roles.clear();

    try {
        const emoji = await message.guild!.emojis.create(image, name, {
            roles: roles.size ? roles : [],
            reason: `Requested by user: ${message.author.tag}`
        });
        return await message.channel.send(`${client.em.check} Successfully created emoji \`\`:${name}:\`\` ${emoji.toString()} ${rolesInfo}`);
    } catch (e: unknown) {
        const error = e as DiscordAPIError;
        console.error(error);
        if (error.code === 30008)
            return message.channel.send(`${client.em.xmark} This server has reached the maximum number of emojis.`);
        if (error.code === 50035) {
            let errmsgs: string[] = error.message.split('\n');
            errmsgs.shift();
            return errmsgs.forEach(errmsg => {
                let err = errmsg.split(': ')[1];
                if (err === 'File cannot be larger than 256.0 kb.')
                    return message.channel.send(`${client.em.xmark} Source image must be under \`256 KB\`.`);
                if (err === 'Invalid image data')
                    return message.channel.send(`${client.em.xmark} The given link does not lead to a valid image.`);
                return message.channel.send(`${client.em.xmark} An unexpected error has occured (fallback A): ${error.message}`);
            });
        }
        if (<string><unknown>error.code === 'ENOENT' || <string><unknown>error.code === 'ENOTFOUND')
            return message.channel.send(`${client.em.xmark} The given link is not a valid URL.`);
        return await message.channel.send(`${client.em.xmark} An unexpected error has occured (fallback B): ${error.message}`);
    }
}

export const config = {
    aliases: ['addemoji', 'createemoji', 'makeemoji'],
    userperms: ['MANAGE_EMOJIS'],
    selfperms: ['MANAGE_EMOJIS'],
    description: 'Creates a new custom emoji in the server.',
    usage: {
        args: '<emoji_name> <image_link | attachment> [--roles] <...@role | ...role_id>',
        flags: {
            roles: 'Restrict the emoji to user\'s with specific roles in the server.'
        }
    }
};
