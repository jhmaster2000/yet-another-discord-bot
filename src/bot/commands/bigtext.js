import Discord from 'discord.js';

export function run(client, message, args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} No text given.`);
    const argsr = args.ordered.map(arg => arg.raw);

    let xltext = [];
    argsr.forEach(arg => {
        arg = arg.replace(/\+/g, '˖').replace(/ /g, '+').replace(/%/g, '％').replace(/>/g, '＞').replace(/</g, '＜').replace(/~/g, '∼')
                 .replace(/`/g, 'ˋ').replace(/\[/g, '［').replace(/\]/g, '］').replace(/\{/g, '｛').replace(/\}/g, '｝');
        xltext.push(encodeURIComponent(arg).replace(/%25/g, '%').replace(/%22%22/g, `''''`));
    });
    xltext = xltext.join('%2B')
    xltext = xltext.replace(/%2B%2B%2B/g, '%E2%80%89').replace(/%7C/g, '%EF%BD%9C').replace(/\./g, '%E2%80%A4');
    
    const embed = new Discord.MessageEmbed()
        .setImage(`https://dummyimage.com/4000x1000/36393e/ffffff&text=${xltext}`)
        .setFooter(`If no image appears, you've used an invalid character.`);
    return message.channel.send(embed);
}

export const config = {
    aliases: ['xl', 'xltext', 'hugetext', 'largetext', 'dummyimage', 'dummyimg'],
    selfperms: ['EMBED_LINKS'],
    description: 'Converts text into a big image.',
    usage: {
        args: '<...text>'
    }
}