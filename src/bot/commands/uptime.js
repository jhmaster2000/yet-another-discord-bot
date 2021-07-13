import prettyms from 'pretty-ms';

export function run(client, message, args) {
    return message.channel.send(`🕓 **I have been online for** \`${prettyms(client.uptime)}\`**!**`);
}

export const config = {
    description: 'Shows how long the bot has been online for.',
}