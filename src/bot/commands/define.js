import Discord from 'discord.js';
import { striptags } from 'striptags';
import got from 'got';

export function run(client, message, args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} You must provide something to search!`);
    args = args.basic.map(arg => arg.raw);

    const query = args.join(' ');
    got.get(`https://duckduckgo.com/js/spice/dictionary/definition/${encodeURIComponent(query)}`).then(response => {
        if (response.body.trim() === 'ddg_spice_dictionary_definition();') return message.channel.send(`${client.em.xmark} No definition found for \`${query}\`.`);
        const body = JSON.parse(response.body.slice(32, -3).trim());

        const mainDef = body[0];
        let definitions = [];
        body.forEach(def => {
            if (!def.text) return;
            def.text = striptags(def.text, { disallowedTags: new Set(['strong']), tagReplacementText: '**' });
            def.text = striptags(def.text, { disallowedTags: new Set(['em', 'i']), tagReplacementText: '*' });
            def.text = def.text.replace(/<xref>([^<>]+)<\/xref>/gi, (match, $1) => {
                return `[${$1}](https://www.wordnik.com/words/${encodeURIComponent($1)})`;
            });
            definitions.push(`• *__\`${def.partOfSpeech || mainDef.partOfSpeech || 'generic'}\`__* ${striptags(def.text)}`);
        });

        const definitionEmbed = new Discord.MessageEmbed()
            .setColor('AQUA')
            .setTitle(`Definitions for "${mainDef.word}"`)
            .setURL(mainDef.wordnikUrl)
            .setDescription(definitions.join('\n'))
            .setFooter(`F${mainDef.attributionText.slice(1)}`, 'https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png');
        return message.channel.send(definitionEmbed);
    });
}

export const config = {
    aliases: ['dictionary', 'dict', 'def'],
    selfperms: ['EMBED_LINKS'],
    description: 'Get dictionary definitions of a word or sentence.',
    usage: {
        args: '<...words>'
    }
};