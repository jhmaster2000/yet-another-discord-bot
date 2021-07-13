export function checkPermissions(client, message, cmd, helpCmd) {
    const self = message.guild.me.permissionsIn(message.channel);
    const user = message.member.permissionsIn(message.channel);
    let selfPerms = cmd.config.selfperms || [];
    let userPerms = cmd.config.userperms || [];
    let selfMiss = [];
    let userMiss = [];

    // false-y values = allowed
    // true-y values  = no permission

    if (!selfPerms && !userPerms) return { code: NaN };

    if (userPerms.includes('SPECIAL:OWNER')) {
        if (message.author.id !== client.owner.id) {
            if (!helpCmd) message.channel.send('🔒 This is a bot owner only command.');
            return { code: -1 };
        }
        userPerms = false;
    }

    if (selfPerms) {
        selfPerms.forEach(perm => {
            if (!self.has(perm)) return selfMiss.push(perm);
            else return;
        });
    }
    if (userPerms) {
        userPerms.forEach(perm => {
            if (!user.has(perm)) return userMiss.push(perm);
            else return;
        });
    }

    if (!selfMiss.length && !userMiss.length) return { code: 0 };
    if (selfMiss.length && !userMiss.length) return selfMissing();
    if (!selfMiss.length && userMiss.length) return userMissing();
    return bothMissing();

    ////////////////

    function selfMissing() {
        let msg = `❌ The bot is missing the following permissions to do this:\n\`\`${selfMiss.join('``, ``')}`;
        if (!helpCmd) message.channel.send(`${msg}\`\``);
        return { code: 1, perms: { user: [null], self: selfMiss } };
    }

    function userMissing() {
        let msg = `❌ You are missing the following permissions to use this:\n\`\`${userMiss.join('``, ``')}`;
        if (!helpCmd) message.channel.send(`${msg}\`\``);
        return { code: 2, perms: { user: userMiss, self: [null] } };
    }

    function bothMissing() {
        let msg = `❌ Both you and the bot are missing permissions to use this:\n`
                + `**You:** \`\`${userMiss.join('``, ``')}\`\`\n**Bot:** \`\`${selfMiss.join('``, ``')}`;
        if (!helpCmd) message.channel.send(`${msg}\`\``);
        return { code: 3, perms: { user: userMiss, self: selfMiss } };
    }
}