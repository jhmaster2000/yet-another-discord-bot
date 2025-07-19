import Discord, { Message } from 'discord.js';
import got from 'got';
import fs from 'fs';
import { join } from 'path';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

const assets = JSON.parse(fs.readFileSync(join(process.env.workdir!, './bot/assets/random.json')).toString()) as RandomAssets;
const items = ['cat', 'dog', 'bench'] as const;
type Items = typeof items[number];
type ItemsClass = { [key in Items]: (message: Message) => void; };
let xmark: string;

interface RandomAssets {
    readonly benches: string[];
}

interface CatDogApiResponse {
    id: string,
    url: string,
    width: number,
    height: number,
}

export async function run(client: Bot, message: Message, argsx: Args) {
    xmark ??= client.em.xmark;
    if (!argsx.basic.length) return invalidArguments(message);
    const args = argsx.basic.map(arg => arg.raw);
    if (items.includes(<Items>args[0].toLowerCase())) return Random[args[0] as Items](message);
    else return invalidArguments(message);
}
function invalidArguments(message: Message) {
    return message.channel.send(`${xmark} You need to tell me what to get a random of!\nValid options: \`${items.join('`, `')}\``);
}

const Random = (class {
    static async #catOrDog(message: Message, type: 'cat' | 'dog') {
        const response = await got.get(`https://api.the${type}api.com/v1/images/search?limit=1`)
            .catch(() => void message.channel.send(`${xmark} Failed to get a random ${type}!`));
        if (!response) return;
        const body = JSON.parse(response.body) as CatDogApiResponse[];
        const embed = new Discord.EmbedBuilder()
            .setTitle(`Here's your random ${type}! ${type === 'cat' ? '🐱' : '🐶'}`)
            .setImage(body[0].url);
        return message.channel.send({ embeds: [embed] });
    }
    static cat = (message: Message) => void Random.#catOrDog(message, 'cat');
    static dog = (message: Message) => void Random.#catOrDog(message, 'dog');
    static bench(message: Message) {
        const selected = assets.benches[Math.floor(Math.random() * assets.benches.length)];
        const embed = new Discord.EmbedBuilder()
            .setTitle('Here\'s your random bench! 🪑')
            .setImage(selected);
        return void message.channel.send({ embeds: [embed] });
    }
}) satisfies ItemsClass;

export const config = {
    aliases: ['rand', 'rng'],
    selfperms: ['EmbedLinks'] satisfies Discord.PermissionsString[],
    description: 'Generic command to get a random image of something.',
    usage: {
        args: '<cat/dog/bench>'
    }
};
