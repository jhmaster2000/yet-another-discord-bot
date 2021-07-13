import Discord from 'discord.js';
import got from 'got';
import fs from 'fs';
import { join } from 'path';
const assets = JSON.parse(fs.readFileSync(join(process.env.workdir, './bot/assets/random.json')));
const items = ['cat', 'dog', 'bench'];

got.get('https://random.dog/doggos').then(response => {
    assets.dogs = JSON.parse(response.body).filter(dog => !dog.endsWith('.mp4'));
});

export function run(client, message, args) {
    if (!args.basic.length) return invalidArguments(client.em.xmark, message);
    args = args.basic.map(arg => arg.raw);
    if (items.includes(args[0].toLowerCase())) return random[args[0]](message);
    else return invalidArguments(client.em.xmark, message);
}

function invalidArguments(xmark, message) {
    return message.channel.send(`${xmark} You need to tell me what to get a random of!\nValid options: \`${items.join('\`, \`')}\``);
}

const random = {
    cat: (message) => {
        got.get('http://aws.random.cat/meow').then(response => {
            const body = JSON.parse(response.body);
            const catEmbed = new Discord.MessageEmbed()
                .setTitle('Here\'s your random cat! 🐱')
                .setImage(body.file);
            return message.channel.send(catEmbed);
        });
    },
    dog: (message) => {
        const selected = assets.dogs[Math.floor(Math.random() * assets.dogs.length)];
        const dogEmbed = new Discord.MessageEmbed()
            .setTitle('Here\'s your random dog! 🐶')
            .setImage(`https://random.dog/${selected}`);
        return message.channel.send(dogEmbed);
    },
    bench: (message) => {
        const selected = assets.benches[Math.floor(Math.random() * assets.benches.length)];
        const benchEmbed = new Discord.MessageEmbed()
            .setTitle('Here\'s your random bench! 🪑')
            .setImage(selected);
        return message.channel.send(benchEmbed);
    }
}

export const config = {
    aliases: ['rand'],
    selfperms: ['EMBED_LINKS'],
    description: 'Generic command to get a random image of something.',
    usage: {
        args: '<cat/dog/bench>'
    }
};