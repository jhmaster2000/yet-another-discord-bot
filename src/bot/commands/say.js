export function run(client, message, args) {
    if (!args.basic.length) return message.channel.send(`🙄 You have to tell me what you want me to say...`);
    args = args.basic.map(arg => arg.raw + arg.trailing).join('');
    message.delete();
    return message.channel.send('💬 ' + args, { disableMentions: 'all' });
}

export const config = {
    aliases: ['echo', 'speak'],
    selfperms: ['MANAGE_MESSAGES'],
    userperms: ['MANAGE_MESSAGES'],
    description: 'Make the bot say something in the current channel.',
    usage: {
        args: '<...text>'
    }
}