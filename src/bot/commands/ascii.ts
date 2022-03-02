import Discord, { Message } from 'discord.js';
import figlet from 'figlet';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, args: Args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} You need to provide some text.`);
    const text = args.basic.map(arg => arg.raw + arg.trailing).join('');

    const opts = {
        font: 'Standard',
        horizontalLayout: 'fitted',
        verticalLayout: 'default'
    } as const

    return figlet.text(text, opts, (err, data) => {
        if (err) {
            void message.channel.send(`${client.em.critical} Something went wrong...`);
            return console.error(err);
        }

        const file = new Discord.MessageAttachment(Buffer.from(data!), 'ascii.txt');
        return message.channel.send({ files: [file] });
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
