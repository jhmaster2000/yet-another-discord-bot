import Discord, { Message } from 'discord.js';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, args: Args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} No text given.`);

    const xltext = args.ordered
        .map(arg => encodeURIComponent(arg.raw + arg.trailing.replace(/[\n\r]+/, ' ')))
        .join('').replace(/%7C/g, '%EF%BD%9C');
    
    const embed = new Discord.EmbedBuilder()
        .setImage(`https://dummyimage.com/4000x1000/36393e/ffffff&text=${xltext}`)
        .setFooter({ text: `If no image appears, you've used an invalid character.` });
    return message.channel.send({ embeds: [embed] });
}

export const config = {
    aliases: ['xl', 'xltext', 'hugetext', 'largetext', 'dummyimage', 'dummyimg'],
    selfperms: ['EmbedLinks'] satisfies Discord.PermissionsString[],
    description: 'Converts text into a big image.',
    usage: {
        args: '<...text>'
    }
}
