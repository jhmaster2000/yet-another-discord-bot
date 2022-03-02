import Discord, { Message } from 'discord.js';
import { striptags } from 'striptags';
import got from 'got';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

type Definitions = {
    text?: string;
    partOfSpeech: string;
    word: string;
    attributionText: string;
    wordnikUrl: string;
}[];

export async function run(client: Bot, message: Message, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`${client.em.xmark} You must provide something to search!`);
    const args = argsx.basic.map(arg => arg.raw);

    const query = args.join(' ');
    const response = await got.get(`https://duckduckgo.com/js/spice/dictionary/definition/${encodeURIComponent(query)}`);
    if (response.body.trim() === 'ddg_spice_dictionary_definition();')
        return message.channel.send(`${client.em.xmark} No definition found for \`${query}\`.`);
    const body = JSON.parse(response.body.slice(32, -3).trim()) as Definitions;
    const mainDef = body[0];
    let definitions: string[] = [];
    body.forEach((def: { text?: string; partOfSpeech: string; }) => {
        if (!def.text) return;
        def.text = striptags(def.text, { disallowedTags: new Set(['strong']), tagReplacementText: '**' });
        def.text = striptags(def.text, { disallowedTags: new Set(['em', 'i']), tagReplacementText: '*' });
        def.text = def.text.replace(/<xref>([^<>]+)<\/xref>/gi, (match, $1: string) => {
            return `[${$1}](https://www.wordnik.com/words/${encodeURIComponent($1)})`;
        });
        definitions.push(`• *__\`${def.partOfSpeech || mainDef.partOfSpeech || 'generic'}\`__* ${striptags(def.text)}`);
    });
    const definitionEmbed = new Discord.MessageEmbed()
        .setColor('AQUA')
        .setTitle(`Definitions for "${mainDef.word}"`)
        .setURL(mainDef.wordnikUrl)
        .setDescription(definitions.join('\n'))
        .setFooter({ text: `F${mainDef.attributionText.slice(1)}`, iconURL: 'https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png' });
    return await message.channel.send({ embeds: [definitionEmbed] });
}

export const config = {
    aliases: ['dictionary', 'dict', 'def'],
    selfperms: ['EMBED_LINKS'],
    description: 'Get dictionary definitions of a word or sentence.',
    usage: {
        args: '<...words>'
    }
};
