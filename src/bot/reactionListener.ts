import { Message, MessageReaction, User } from 'discord.js';
import Bot from './Bot.js';

export interface CustomReactions {
    no: string;
    yes: string;
}

export default function loadReactionListener(client: Bot): void {
    client.promptYesNo = (from: User, msg: Message, callback: (answer: boolean | null) => void, timeout?: number, reactions?: CustomReactions): void => {
        void msg.react(reactions?.no || client.re.xmark).then(() => msg.react(reactions?.yes || client.re.check));

        const filter = (reaction: MessageReaction, user: User) => user.id === from.id;
        const collector = msg.createReactionCollector({ filter, idle: timeout || 10000 });

        collector.on('collect', (reaction, thisCollector): void => {
            if (reaction.emoji.id === (reactions?.yes || client.re.check)) collector.stop('true');
            if (reaction.emoji.id === (reactions?.no || client.re.xmark)) collector.stop('false');
        });

        collector.on('end', (collected, reason) => {
            let answer = null;
            if (reason === 'idle' || reason === 'time') answer = null;
            if (reason === 'false') answer = false;
            if (reason === 'true') answer = true;
            return callback(answer);
        });
    }
}
