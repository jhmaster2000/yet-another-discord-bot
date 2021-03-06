export function run(client, message, args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} Please provide a mention or ID of at least one channel.`);

    const argsr = args.ordered.map(arg => arg.raw);
    const channels = message.mentions.channels;

    let invalidChannels = [];
    argsr.forEach(possibleChannelID => {
        if (possibleChannelID.trim().match(/^<#[0-9]{17,20}>$/g)) return;
        const possibleChannel = message.guild.channels.cache.get(possibleChannelID);
        if (!possibleChannel) return invalidChannels.push(RegExp.escapeBacktick(possibleChannelID));
        else return channels.set(possibleChannel.id, possibleChannel);
    });
    if (!channels.size) return message.channel.send(`${client.em.xmark} Could not resolve any valid channels from your input.`);
    if (channels.size > 5) return message.channel.send(`${client.em.xmark} Only up to **5** channels can be deleted at once.`);

    let issues = [];
    let s = invalidChannels.length === 1 ? '' : 's';
    if (invalidChannels.length) issues.push(`⚠️ Failed to resolve **${invalidChannels.length}** argument${s} into valid channels:\n\`\`${invalidChannels.join('``, ``')}\`\``);

    if (!message.member.hasPermission('ADMINISTRATOR')) {
        let notEditableByUser = [];
        channels.filter(channel => !message.member.permissionsIn(channel).has('MANAGE_CHANNELS')).forEach(channel => {
            notEditableByUser.push(channel);
            channels.delete(channel.id);
        });
        s = notEditableByUser.length === 1 ? '' : 's';
        if (notEditableByUser.length) issues.push(`⚠️ Refusing to delete the **${notEditableByUser.length}** channel${s} listed below because it's permission overwrites do not allow you to delete it:\n${notEditableByUser.join(' | ')}`);
    }

    s = channels.size === 1 ? '' : 's';
    message.channel.send(`${issues.join('\n')}\n\n⁉️ Are you sure you want to __permanently__ delete the **${channels.size}** channel${s} listed below?\n${channels.map(c => c).join(' | ')}`).then(msg => {
        client.promptYesNo(message.author, msg, async (answer) => {
            msg.reactions.removeAll();
            const timedout = answer === null ? '(Timed out)' : '';
            if (!answer) return msg.edit(`${client.em.neutral} Cancelled deletion of **${channels.size}** channel${s}. ${timedout}`);

            let results = [];
            for (const channel of channels.map(c => c)) {
                await channel.delete(`Requested by user: ${message.author.tag}`).then(() => {
                    return results.push(`${client.em.check} Successfully deleted channel: **\`\`${channel.name}\`\`**`);
                }).catch(error => {
                    console.error('[DELCHANNEL_ERROR]', error);
                    return results.push(`${client.em.xmark} Failed to delete ${channel}, does the bot have permissions to view and manage it?`);
                });
            }
            return msg.edit(results.join('\n')).catch(err => {
                results.unshift('ℹ️ You are receiving this message because you deleted the channel you used the command on.');
                message.author.send(results.join('\n'));
            });
        });
    });
}

export const config = {
    aliases: ['deletechannel', 'deletechannels', 'delchannels'],
    userperms: ['MANAGE_CHANNELS'],
    selfperms: ['MANAGE_CHANNELS', 'ADD_REACTIONS'],
    description: 'Deletes between 1 to 5 server channels.',
    usage: {
        args: '<...#channel | ...channel_id>'
    }
};