export function run(client, message, args) {
    const permissions = 4259179767;
    const link = `<https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=${permissions}>`;
    return message.channel.send(`**__Use the link below to invite the bot to your server:__**\n${link}`);
}

export const config = {
    aliases: ['binv', 'botinv'],
    description: 'Provides invite link to add the bot to your server.'
}