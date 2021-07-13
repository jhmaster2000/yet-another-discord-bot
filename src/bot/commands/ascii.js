import Discord from 'discord.js';
import figlet from 'figlet';

export function run(client, message, args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} You need to provide some text.`);
    args = args.basic.map(arg => arg.raw + arg.trailing).join('');

    const opts = {
        font: 'Standard',
        horizontalLayout: 'fitted',
        verticalLayout: 'default'
    }

    figlet.text(args, opts, (err, data) => {
        if (err) {
            message.channel.send(`${client.em.critical} Something went wrong...`);
            return console.error(err);
        }

        const file = new Discord.MessageAttachment(Buffer.from(data), 'ascii.txt');
        return message.channel.send(file);
    });
}

export const config = {
    aliases: ['asciiart', 'textart'],
    selfperms: ['ATTACH_FILES', 'EMBED_LINKS'],
    description: 'Converts text into ASCII art.',
    usage: {
        args: '<...text>'
    }
}