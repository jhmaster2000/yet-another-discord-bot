export function run(client, message, args) {
    args = args.ordered.map(arg => arg.value);
    const msgcount = Number(args[0]);

    if (isNaN(msgcount) || (msgcount < 1 || msgcount > 99)) return message.channel.send(`${client.em.xmark} Please provide a number from 1 to 99 as argument!`);

    message.channel.bulkDelete(msgcount + 1, true).then(deleted => {
        let notDeleted = '';
        const diffcount = msgcount + 1 - deleted.size;
        if (deleted.size === 0) return message.channel.send(`${client.em.xmark} No messages deleted due to all messages on this channel being older than 2 weeks.`);
        if (diffcount !== 0) notDeleted = `\n⚠️ \`${diffcount}\` were not deleted due to being older than 2 weeks.`
        return message.channel.send(`${client.em.check} Successfully deleted \`${deleted.size - 1}\` messages.${notDeleted}`).then(msg => {
            setTimeout(() => {
                msg.delete();
            }, 4500);
        });
    }).catch(err => {
        return message.channel.send(`${client.em.xmark} Failed to delete messages. (Note: Messages older than 2 weeks can't be deleted!)`);
    });
}

export const config = {
    aliases: ['prune', 'bulkdel', 'bulkdelete', 'clear'],
    selfperms: ['MANAGE_MESSAGES'],
    userperms: ['MANAGE_MESSAGES'],
    description: 'Mass-deletes multiple messages in the current channel.',
    usage: {
        args: '<number_of_messages_to_delete>'
    }
}