import Discord, { Message } from 'discord.js';
import got from 'got';
import fs from 'fs';
import { join } from 'path';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';
const assets = JSON.parse(fs.readFileSync(join(process.env.workdir!, './bot/assets/random.json')).toString()) as RandomAssets;
const items = ['cat', 'dog', 'bench'] as const;

interface RandomAssets {
    readonly benches: string[];
    dogs: string[];
    cats: string[];
}

await got.get('https://random.dog/doggos').then(response => {
    assets.dogs = (<string[]>JSON.parse(response.body)).filter((dog: string) => !dog.endsWith('.mp4'));
});

export function run(client: Bot, message: Message, argsx: Args) {
    if (!argsx.basic.length) return invalidArguments(client.em.xmark, message);
    const args = argsx.basic.map(arg => arg.raw);
    if (items.includes(<'cat' | 'dog' | 'bench'>args[0].toLowerCase())) return random[<keyof typeof random>args[0]](message);
    else return invalidArguments(client.em.xmark, message);
}

function invalidArguments(xmark: string, message: Message) {
    return message.channel.send(`${xmark} You need to tell me what to get a random of!\nValid options: \`${items.join('`, `')}\``);
}

const random = {
    cat: (message: Message) => {
        void got.get('http://aws.random.cat/meow').then(response => {
            const body = JSON.parse(response.body) as { file: string };
            const catEmbed = new Discord.EmbedBuilder()
                .setTitle('Here\'s your random cat! 🐱')
                .setImage(body.file);
            return void message.channel.send({ embeds: [catEmbed] });
        });
    },
    dog: (message: Message) => {
        const selected = assets.dogs[Math.floor(Math.random() * assets.dogs.length)];
        const dogEmbed = new Discord.EmbedBuilder()
            .setTitle('Here\'s your random dog! 🐶')
            .setImage(`https://random.dog/${selected}`);
        return message.channel.send({ embeds: [dogEmbed] });
    },
    bench: (message: Message) => {
        const selected = assets.benches[Math.floor(Math.random() * assets.benches.length)];
        const benchEmbed = new Discord.EmbedBuilder()
            .setTitle('Here\'s your random bench! 🪑')
            .setImage(selected);
        return message.channel.send({ embeds: [benchEmbed] });
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
