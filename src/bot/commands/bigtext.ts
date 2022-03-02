import Discord, { Message } from 'discord.js';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, args: Args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} No text given.`);
    const argsr = args.ordered.map(arg => arg.raw);

    let xltext: string[] = [];
    argsr.forEach(arg => {
        arg = arg.replace(/\+/g, '˖').replace(/ /g, '+').replace(/%/g, '％').replace(/>/g, '＞').replace(/</g, '＜').replace(/~/g, '∼')
                 .replace(/`/g, 'ˋ').replace(/\[/g, '［').replace(/\]/g, '］').replace(/\{/g, '｛').replace(/\}/g, '｝');
        xltext.push(encodeURIComponent(arg).replace(/%25/g, '%').replace(/%22%22/g, `''''`));
    });
    let xltextStr: string = xltext.join('%2B').replace(/%2B%2B%2B/g, '%E2%80%89').replace(/%7C/g, '%EF%BD%9C').replace(/\./g, '%E2%80%A4');
    
    const embed = new Discord.MessageEmbed()
        .setImage(`https://dummyimage.com/4000x1000/36393e/ffffff&text=${xltextStr}`)
        .setFooter({ text: `If no image appears, you've used an invalid character.` });
    return message.channel.send({ embeds: [embed] });
}

export const config = {
    aliases: ['xl', 'xltext', 'hugetext', 'largetext', 'dummyimage', 'dummyimg'],
    selfperms: ['EMBED_LINKS'],
    description: 'Converts text into a big image.',
    usage: {
        args: '<...text>'
    }
}
