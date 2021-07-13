export function run(client, message, args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} Cannot send empty message.`);
    args = args.basic.map(arg => arg.raw + arg.trailing);
    const webhookText = args.join('');

    message.channel
        .createWebhook(message.member.displayName, {
            avatar: message.author.displayAvatarURL({ dynamic: true, format: 'png' }),
            reason: `User ${message.author.tag} ran "botify" command.`
        })
        .then(webhook => {
            message.delete();
            webhook.send(webhookText, { disableEveryone: true }).then(() => webhook.delete());
        })
        .catch(err => {
            console.error(err);
            return message.channel.send(`${client.em.xmark} An unexpected error occured when trying to run this command.`);
        });
}

export const config = {
    aliases: ['hook', 'hookify', 'webhookify'],
    selfperms: ['MANAGE_MESSAGES', 'MANAGE_WEBHOOKS'],
    userperms: ['MANAGE_MESSAGES'],
    description: 'Sends a message as you, but as a bot.',
    usage: {
        args: '<...message>'
    }
};