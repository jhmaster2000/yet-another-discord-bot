import Discord, { Message } from 'discord.js';
import Bot from '../Bot.js';
import { Args } from '../events/message.js';

export function run(client: Bot, message: Message, args: Args) {
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
};
