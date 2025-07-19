import Discord, { Message } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message<true>, args: Args) {
    void message.channel.send(`${client.em.loadingfast} Pinging...`).then(msg => {
        const ping = msg.createdTimestamp - message.createdTimestamp;
        const result = new Discord.EmbedBuilder()
            .setColor(0x00FF00)
            .setDescription(`🏓 **Ping:** ${ping}ms\n💓 **Heartbeat:** ${client.ws.ping}ms`);
        void msg.delete();
        return void message.channel.send({ embeds: [result] });
    });
}

export const config = {
    aliases: ['pong'],
    selfperms: ['EmbedLinks'] satisfies Discord.PermissionsString[],
    description: 'Pings the bot to see if it\'s online'
};
