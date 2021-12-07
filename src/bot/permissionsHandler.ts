import { Message, PermissionString } from 'discord.js';
import Bot from './Bot.js';

enum PermissionCode {
    NO_REQUIREMENTS = NaN,
    ALLOWED         = 0,
    OWNER_ONLY      = -1,
    SELF_MISSING    = 1,
    USER_MISSING    = 2,
    BOTH_MISSING    = 3,
};

interface PermissionData {
    code: PermissionCode;
    perms?: { user: PermissionString[], self: PermissionString[] };
}

export function checkPermissions(client: Bot, message: Message, cmd: any, helpCmd: boolean = false): PermissionData {
    const self = message.guild!.me!.permissionsIn(message.channel);
    const user = message.member!.permissionsIn(message.channel);
    let selfPerms = cmd.config.selfperms || [];
    let userPerms = cmd.config.userperms || [];
    let selfMiss: PermissionString[] = [];
    let userMiss: PermissionString[] = [];

    if (!selfPerms.length && !userPerms.length) return { code: NaN };

    if (userPerms.includes('SPECIAL:OWNER')) {
        if (message.author.id !== client.owner.id) {
            if (!helpCmd) message.channel.send('🔒 This is a bot owner only command.');
            return { code: -1 };
        }
        userPerms = [];
    }

    if (selfPerms.length) {
        selfPerms.forEach((perm: PermissionString) => {
            if (!self.has(perm)) return selfMiss.push(perm);
        });
    }
    if (userPerms.length) {
        userPerms.forEach((perm: PermissionString) => {
            if (!user.has(perm)) return userMiss.push(perm);
        });
    }

    if (!selfMiss.length && !userMiss.length) return { code: 0 };
    if (selfMiss.length && !userMiss.length) return selfMissing();
    if (!selfMiss.length && userMiss.length) return userMissing();
    return bothMissing();

    ////////////////

    function selfMissing(): PermissionData {
        let msg = `❌ The bot is missing the following permissions to do this:\n\`\`${selfMiss.join('``, ``')}`;
        if (!helpCmd) message.channel.send(`${msg}\`\``);
        return { code: 1, perms: { user: [], self: selfMiss } };
    }

    function userMissing(): PermissionData {
        let msg = `❌ You are missing the following permissions to use this:\n\`\`${userMiss.join('``, ``')}`;
        if (!helpCmd) message.channel.send(`${msg}\`\``);
        return { code: 2, perms: { user: userMiss, self: [] } };
    }

    function bothMissing(): PermissionData {
        let msg = `❌ Both you and the bot are missing permissions to use this:\n`
                + `**You:** \`\`${userMiss.join('``, ``')}\`\`\n**Bot:** \`\`${selfMiss.join('``, ``')}`;
        if (!helpCmd) message.channel.send(`${msg}\`\``);
        return { code: 3, perms: { user: userMiss, self: selfMiss } };
    }
}
