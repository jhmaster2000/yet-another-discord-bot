import { Message } from 'discord.js';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

const fortunes = [
    /* Positive answers */
    'Yes.',
    'Probably.',
    'Certainly yes.',
    'It is very likely so.',
    'It is a possibility.',
    'Definitely yes.',
    'It is undoubtfully so.',
    'Absolutely.',
    'That is true and real.',
    'That is correct.',

    /* Neutral answers */
    'I don\'t know.',
    'Maybe.',
    'Perhaps.',
    'It is uncertain.',
    'That\'s a trick question.',
    '8ball is busy at the moment, try again later!',
    'I refuse to answer that.',
    'I think you know the answer.',
    'Now why would you ask that?',
    'Seriously? That\'s your question?',
    'I hate this job...',
    'That\'s the dumbest question I\'ve heard.',

    /* Negative answers */
    'No.',
    'Probably not.',
    'Certainly no.',
    'It is unlikely.',
    'Doubtful.',
    'Most definitely not.',
    'That is simply not true.',
    'Simply absurd.',
    'That is false and fake.',
    'Lies and myths.'
];

export function run(client: Bot, message: Message, args: Args) {
    if (!args.basic.length) return message.channel.send(`🤦 You have to ask a question smooth brain.`);
    const answer = fortunes[Math.floor(Math.random() * fortunes.length)];
    return message.channel.send(`🎱 ${answer}`);
}

export const config = {
    aliases: ['8b', ':8ball:', '🎱'],
    description: 'Ask a question to the wise magic 8ball.',
    usage: {
        args: '<...question>'
    }
}
