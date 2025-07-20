import Discord, { type ColorResolvable, Message } from 'discord.js';
import got from 'got';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

const enum Types {
    article = 'A',
    disambig = 'D',
    category = 'C',
    name = 'N',
    exclusive = 'E'
}

type DDGNull = '';
type HTMLString = string;
type Result = {
    FirstURL: string;
    Icon: {
        Height: number | DDGNull;
        URL: string;
        Width: number | DDGNull;
    };
    Result: HTMLString;
    Text: string;
};
type InfoboxField = {
    data_type: string;
    label: string;
    value: unknown;
};
type Infobox = {
    content: (InfoboxField & { wiki_order: number | string })[];
    meta: InfoboxField[];
};

interface DuckDuckGoResponse {
    Type: Types;
    Abstract: string;
    AbstractSource: string;
    AbstractText: string;
    AbstractURL: string;
    Answer: string;
    AnswerType: string;
    Definition: string;
    DefinitionSource: string;
    DefinitionURL: string;
    Entity: string;
    Heading: string;
    Image: string;
    ImageHeight: number | DDGNull;
    ImageIsLogo: number | DDGNull;
    ImageWidth: number | DDGNull;
    Infobox: Infobox | DDGNull;
    OfficialDomain?: string;
    OfficialWebsite?: string;
    Redirect: string;
    RelatedTopics: Result[];
    Results: Result[];
}

export async function run(client: Bot<true>, message: Message<true>, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`${client.em.xmark} You must provide something to search!`);
    const args = argsx.basic.map(arg => arg.raw);

    const query = args.join(' ').toLowerCase();
    return got.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1&no_redirect=1`).then(response => {
        const data = JSON.parse(response.body) as DuckDuckGoResponse;
        if (!data.Type || data.Redirect) {
            console.log('[DDG-BADRES]', query, data);
            return void message.channel.send(`${client.em.xmark} No valid results found!*`);
        }

        if (data.AbstractURL) {
            if (data.Type === Types.disambig) data.Heading = data.Heading + ' (disambiguation)';

            const ddgEmbed = new Discord.EmbedBuilder()
                .setAuthor({ name: 'DuckDuckGo QuickSearch Results:', iconURL: 'https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png' })
                .setTitle(`${data.AbstractSource} - ${data.Heading}`)
                .setURL(data.AbstractURL)
                .setFooter({ text: `Result type: web` })
                .setColor('Orange');
            let ellipsis = (data.AbstractText.length > 200) ? '...' : '';
            if (data.AbstractText) ddgEmbed.setDescription(data.AbstractText.slice(0, 200).trim() + ellipsis);
            if (data.Image) ddgEmbed.setThumbnail('https://api.duckduckgo.com' + data.Image);

            if (data.RelatedTopics.length) {
                let related: string[] = [];
                data.RelatedTopics.forEach((topic: { FirstURL: string; }, index: number): void => {
                    if (index >= 5) return;
                    if (!topic.FirstURL) return;
                    let tempArray = topic.FirstURL.split('/');
                    const topicTitle = decodeURIComponent(tempArray.at(-1)!).replace(/_/g, ' ');
                    related.push(`• [${topicTitle}](${topic.FirstURL})`);
                });
                ddgEmbed.addFields({ name: 'Related results', value: related.join('\n') });
            }
            return void message.channel.send({ embeds: [ddgEmbed] });
        } else if (data.Answer) {
            if (data.AnswerType === 'ip' || data.AnswerType === 'iploc') return void message.channel.send(`${client.em.xmark} No valid results found!`);
            if (data.AnswerType === 'color_code') {
                const colorHex = data.Answer.slice(6).split(' ~ ')[0].trim();
                const ddgEmbed = new Discord.EmbedBuilder()
                    .setAuthor({ name: 'DuckDuckGo QuickSearch Results:', iconURL: 'https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png' })
                    .setDescription(data.Answer.replace(/ ~ /g, '\n').replace(/^([A-Z]+)\((.+)\)/gmi, '$1: $2').replace(/^([A-Z]+:)/gmi, '**$1**'))
                    .setFooter({ text: `Result type: color` })
                    .setThumbnail(`https://color.aero.bot/color?color=${colorHex}`)
                    .setColor(colorHex as ColorResolvable);
                return void message.channel.send({ embeds: [ddgEmbed] });
            }

            const ddgEmbed = new Discord.EmbedBuilder()
                .setAuthor({ name: 'DuckDuckGo QuickSearch Results:', iconURL: 'https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png' })
                .setDescription(`${data.Answer}`)
                .setFooter({ text: `Result type: ${data.AnswerType.replace(/_/g, ' ') || '-'}` })
                .setColor('DarkAqua');
            return void message.channel.send({ embeds: [ddgEmbed] });
        } else {
            console.log('[DDG-NORES]', query, data, data);
            return void message.channel.send(`${client.em.xmark} No results found!`);
        }
    }).catch(err => {
        console.error(err);
        void message.channel.send(`${client.em.xmark} An error occured when trying to search. Try again later.`);
    });
}

export const config = {
    aliases: ['ducksearch', 'duckduckgo', 'ddgsearch', 'quicksearch'],
    selfperms: ['EmbedLinks'] satisfies Discord.PermissionsString[],
    description: 'Searches DuckDuckGo for information.',
    usage: {
        args: '<...search>'
    }
}
