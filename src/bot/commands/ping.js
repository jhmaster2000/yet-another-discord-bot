import Discord from 'discord.js';

export function run(client, message, args) {
    message.channel.send(`${client.em.loadingfast} Pinging...`).then(msg => {
        const ping = msg.createdTimestamp - message.createdTimestamp;
        const result = new Discord.MessageEmbed()
            .setColor(0x00FF00)
            .setDescription(`🏓 **Ping:** ${ping}ms\n💓 **Heartbeat:** ${client.ws.ping}ms`);
        msg.delete();
        return message.channel.send(result);
    });
}

export const config = {
    aliases: ['pong'],
    selfperms: ['EMBED_LINKS'],
    description: 'Pings the bot to see if it\'s online'
}