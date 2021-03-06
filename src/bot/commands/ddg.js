import Discord from 'discord.js';
import got from 'got';

const Types = {
    article: 'A',
    disambig: 'D',
    category: 'C',
    name: 'N',
    exclusive: 'E'
};

export function run(client, message, args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} You must provide something to search!`);
    args = args.basic.map(arg => arg.raw);

    const query = args.join(' ').toLowerCase();
    got.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1&no_redirect=1`).then(response => {
        const data = JSON.parse(response.body);
        if (!data.Type || data.Redirect) return message.channel.send(`${client.em.xmark} No results found!`);

        if (data.AbstractURL) {
            if (data.Type === Types.disambig) data.Heading = data.Heading + ' (disambiguation)';

            const ddgEmbed = new Discord.MessageEmbed()
                .setAuthor('DuckDuckGo QuickSearch Results:', 'https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png')
                .setTitle(`${data.AbstractSource} - ${data.Heading}`)
                .setURL(data.AbstractURL)
                .setFooter(`Result type: web`)
                .setColor('ORANGE');
            let ellipsis = (data.AbstractText.length > 200) ? '...' : '';
            if (data.AbstractText) ddgEmbed.setDescription(data.AbstractText.slice(0, 200).trim() + ellipsis);
            if (data.Image) ddgEmbed.setThumbnail('https://api.duckduckgo.com' + data.Image);

            if (data.RelatedTopics.length) {
                let related = [];
                data.RelatedTopics.forEach((topic, index) => {
                    if (index >= 5) return;
                    if (!topic.FirstURL) return;
                    let tempArray = topic.FirstURL.split('/');
                    const topicTitle = decodeURIComponent(tempArray[tempArray.length - 1]).replace(/_/g, ' ');
                    related.push(`• [${topicTitle}](${topic.FirstURL})`);
                });
                ddgEmbed.addField('Related results', related.join('\n'));
            }
            return message.channel.send(ddgEmbed);
        } else if (data.Answer) {
            if (data.AnswerType === 'ip' || data.AnswerType === 'iploc') return message.channel.send(`${client.em.xmark} No results found!`);
            if (data.AnswerType === 'color_code') {
                const colorHex = data.Answer.slice(6).split(' ~ ')[0].trim();
                const ddgEmbed = new Discord.MessageEmbed()
                    .setAuthor('DuckDuckGo QuickSearch Results:', 'https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png')
                    .setDescription(data.Answer.replace(/ ~ /g, '\n').replace(/^([A-Z]+)\((.+)\)/gmi, '$1: $2').replace(/^([A-Z]+:)/gmi, '**$1**'))
                    .setFooter(`Result type: color`)
                    .setThumbnail(`https://color.aero.bot/color?color=${colorHex}`)
                    .setColor(colorHex);
                return message.channel.send(ddgEmbed);
            }

            const ddgEmbed = new Discord.MessageEmbed()
                .setAuthor('DuckDuckGo QuickSearch Results:', 'https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png')
                .setDescription(`${data.Answer}`)
                .setFooter(`Result type: ${data.AnswerType.replace(/_/g, ' ') || '-'}`)
                .setColor('CYAN');
            return message.channel.send(ddgEmbed);
        }
    }).catch(err => {
        console.error(err);
        return message.channel.send(`${client.em.xmark} An error occured when trying to search. Try again later.`);
    });
}

export const config = {
    aliases: ['ducksearch', 'duckduckgo', 'ddgsearch', 'quicksearch'],
    selfperms: ['EMBED_LINKS'],
    description: 'Searches DuckDuckGo for information.',
    usage: {
        args: '<...search>'
    }
};