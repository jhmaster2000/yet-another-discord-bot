import { Message, User } from 'discord.js';
import Bot from './Bot.js';

export default function loadPaginator(client: Bot): void {
    client.paginate = (message: Message, pages: any[], pagesCount: number, timeout?: number, startPage?: number): void => {
        const authorAvatar = message.author.displayAvatarURL({ dynamic: true, format: 'png' });
        message.channel.send(pages[startPage || 0].setFooter(`${(startPage || 0) + 1}/${pagesCount}`, authorAvatar)).then((msg: Message): void => {
            msg.react('⏮').then(() => {
                msg.react('⏪').then(() => {
                    msg.react('⬅').then(() => {
                        msg.react('🛑').then(() => {
                            msg.react('➡').then(() => {
                                msg.react('⏩').then(() => {
                                    msg.react('⏭');
                                });
                            });
                        });
                    });
                });
            });

            let currentPage = 0;
            const filter = (reaction: string, user: User) => user.id === message.author.id;
            const collector = msg.createReactionCollector(filter, { idle: timeout || 30000 });

            collector.on('collect', (reaction, thisCollector) => {
                if (reaction.emoji.name === '➡') {
                    msg.reactions.cache.get('➡')!.users.remove(message.author.id);
                    if (currentPage === pagesCount - 1) currentPage = 0;
                    else currentPage += 1;
                    msg.edit({ embed: pages[currentPage].setFooter(`${currentPage + 1}/${pagesCount}`, authorAvatar) });
                }
                if (reaction.emoji.name === '⬅') {
                    msg.reactions.cache.get('⬅')!.users.remove(message.author.id);
                    if (currentPage === 0) currentPage = pagesCount - 1;
                    else currentPage -= 1;
                    msg.edit({ embed: pages[currentPage].setFooter(`${currentPage + 1}/${pagesCount}`, authorAvatar) });
                }
                if (reaction.emoji.name === '⏩') {
                    msg.reactions.cache.get('⏩')!.users.remove(message.author.id);
                    if (currentPage + 10 > pagesCount - 1) currentPage = (currentPage + 10) - pagesCount;
                    else currentPage += 10;
                    msg.edit({ embed: pages[currentPage].setFooter(`${currentPage + 1}/${pagesCount}`, authorAvatar) });
                }
                if (reaction.emoji.name === '⏪') {
                    msg.reactions.cache.get('⏪')!.users.remove(message.author.id);
                    if (currentPage - 10 < 0) currentPage = (currentPage - 10) + pagesCount;
                    else currentPage -= 10;
                    msg.edit({ embed: pages[currentPage].setFooter(`${currentPage + 1}/${pagesCount}`, authorAvatar) });
                }
                if (reaction.emoji.name === '⏭') {
                    msg.reactions.cache.get('⏭')!.users.remove(message.author.id);
                    if (currentPage + 50 > pagesCount - 1) currentPage = (currentPage + 50) - pagesCount;
                    else currentPage += 50;
                    msg.edit({ embed: pages[currentPage].setFooter(`${currentPage + 1}/${pagesCount}`, authorAvatar) });
                }
                if (reaction.emoji.name === '⏮') {
                    msg.reactions.cache.get('⏮')!.users.remove(message.author.id);
                    if (currentPage - 50 < 0) currentPage = (currentPage - 50) + pagesCount;
                    else currentPage -= 50;
                    msg.edit({ embed: pages[currentPage].setFooter(`${currentPage + 1}/${pagesCount}`, authorAvatar) });
                }
                if (reaction.emoji.name === '🛑') collector.stop();
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'idle' || reason === 'time') reason = 'Paginator timed out.';
                else reason = 'Paginator terminated by user.';
                msg.edit({ embed: pages[currentPage].setFooter(reason, message.author.displayAvatarURL({ dynamic: true, format: 'png' })) });
                msg.reactions.removeAll();
            });
        });
    }
}
