import Discord, { Message } from 'discord.js';
import got from 'got';
import Utils from '../../utils.js';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export async function run(client: Bot, message: Message, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`${client.em.xmark} Missing input.`);
    const args = argsx.basic.map(arg => arg.raw).join(' ');

    try {
        const response = await got.post(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_APIKEY}`, {
            body: `{ comment: { text: '${args}' }, languages: ['en'], requestedAttributes: { TOXICITY:{} } }`,
            headers: { 'Content-Type': 'application/json' }
        });
        const body = JSON.parse(response.body);
        const score = body.attributeScores.TOXICITY.summaryScore.value;
        let color = 0;
        let label = '';

        if (score >= 0.76) {
            color = 13828345;
            label = 'Extremely toxic';
        } else if (score >= 0.5 && score < 0.76) {
            color = 9909757;
            label = 'Highly toxic';
        } else if (score >= 0.25 && score < 0.5) {
            color = 6125308;
            label = 'Slightly toxic';
        } else {
            color = 2408953;
            label = 'Not toxic';
        }

        const toxicEmbed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(`${label} (${percentFormat(score)}%)`)
            .setDescription(Utils.escapeMarkdown(args))
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true, format: 'png' }) })
            .setTimestamp();
        return await message.channel.send({ embeds: [toxicEmbed] });
    } catch (err) {
        if (!process.env.PERSPECTIVE_APIKEY) console.warn('[MISSING_APIKEY] The PERSPECTIVE_APIKEY is missing!');
        return await message.channel.send(`${client.em.xmark} An unexpected error occured. Try again later.`);
    }
}

function percentFormat(x: string): string {
    return (parseFloat(x) * 100).toFixed(1);
}

export const config = {
    aliases: ['rude', 'rudeness', 'toxicity'],
    selfperms: ['EMBED_LINKS'],
    description: 'Analyzes a piece of text and rates how toxic (rude) it is.',
    usage: {
        args: '<...text>'
    }
}
