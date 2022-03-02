import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import Bot from './Bot.js';

export default function loadPaginator(client: Bot): void {
    client.paginate = (message: Message, pages: MessageEmbed[], pagesCount: number, timeout?: number, startPage?: number): void => {
        const authorAvatar = message.author.displayAvatarURL({ dynamic: true, format: 'png' });
        void message.channel.send({ embeds: [pages[startPage || 0].setFooter({ text: `${(startPage || 0) + 1}/${pagesCount}`, iconURL: authorAvatar })] }).then((msg: Message): void => {
            void msg.react('⏮').then(() => {
                void msg.react('⏪').then(() => {
                    void msg.react('⬅').then(() => {
                        void msg.react('🛑').then(() => {
                            void msg.react('➡').then(() => {
                                void msg.react('⏩').then(() => {
                                    void msg.react('⏭');
                                });
                            });
                        });
                    });
                });
            });

            let currentPage = 0;
            const filter = (reaction: MessageReaction, user: User) => user.id === message.author.id;
            const collector = msg.createReactionCollector({ filter, idle: timeout || 30000 });

            collector.on('collect', (reaction, thisCollector) => {
                if (reaction.emoji.name === '➡') {
                    void msg.reactions.cache.get('➡')!.users.remove(message.author.id);
                    if (currentPage === pagesCount - 1) currentPage = 0;
                    else currentPage += 1;
                    void msg.edit({ embeds: [pages[currentPage].setFooter({ text: `${currentPage + 1}/${pagesCount}`, iconURL: authorAvatar })] });
                }
                if (reaction.emoji.name === '⬅') {
                    void msg.reactions.cache.get('⬅')!.users.remove(message.author.id);
                    if (currentPage === 0) currentPage = pagesCount - 1;
                    else currentPage -= 1;
                    void msg.edit({ embeds: [pages[currentPage].setFooter({ text: `${currentPage + 1}/${pagesCount}`, iconURL: authorAvatar })] });
                }
                if (reaction.emoji.name === '⏩') {
                    void msg.reactions.cache.get('⏩')!.users.remove(message.author.id);
                    if (currentPage + 10 > pagesCount - 1) currentPage = (currentPage + 10) - pagesCount;
                    else currentPage += 10;
                    void msg.edit({ embeds: [pages[currentPage].setFooter({ text: `${currentPage + 1}/${pagesCount}`, iconURL: authorAvatar })] });
                }
                if (reaction.emoji.name === '⏪') {
                    void msg.reactions.cache.get('⏪')!.users.remove(message.author.id);
                    if (currentPage - 10 < 0) currentPage = (currentPage - 10) + pagesCount;
                    else currentPage -= 10;
                    void msg.edit({ embeds: [pages[currentPage].setFooter({ text: `${currentPage + 1}/${pagesCount}`, iconURL: authorAvatar })] });
                }
                if (reaction.emoji.name === '⏭') {
                    void msg.reactions.cache.get('⏭')!.users.remove(message.author.id);
                    if (currentPage + 50 > pagesCount - 1) currentPage = (currentPage + 50) - pagesCount;
                    else currentPage += 50;
                    void msg.edit({ embeds: [pages[currentPage].setFooter({ text: `${currentPage + 1}/${pagesCount}`, iconURL: authorAvatar })] });
                }
                if (reaction.emoji.name === '⏮') {
                    void msg.reactions.cache.get('⏮')!.users.remove(message.author.id);
                    if (currentPage - 50 < 0) currentPage = (currentPage - 50) + pagesCount;
                    else currentPage -= 50;
                    void  msg.edit({ embeds: [pages[currentPage].setFooter({ text: `${currentPage + 1}/${pagesCount}`, iconURL: authorAvatar })] });
                }
                if (reaction.emoji.name === '🛑') collector.stop();
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'idle' || reason === 'time') reason = 'Paginator timed out.';
                else reason = 'Paginator terminated by user.';
                void msg.edit({ embeds: [pages[currentPage].setFooter({ text: reason, iconURL: message.author.displayAvatarURL({ dynamic: true, format: 'png' }) })] });
                void msg.reactions.removeAll();
            });
        });
    }
}
