import Discord from 'discord.js';
Error.stackTraceLimit = Number(process.env.STACKTRACE_LIMIT);

/* Client Setup */
const client = new Discord.Client({ disableMentions: 'everyone', allowedMentions: { parse: ['users'] } });

client.isWin = (process.platform === 'win32');
client.prefixes = ['plz'];
if (!process.env.PRODUCTION) client.prefixes = ['pl'];

import loadCustomEmojis from './loadCustomEmojis.js'; loadCustomEmojis(client);
import loadCommands from './loadCommands.js'; loadCommands(client);
import loadEvents from './loadEvents.js'; loadEvents(client);
import loadPaginator from './paginator.js'; loadPaginator(client);
import loadReactionListener from './reactionListener.js'; loadReactionListener(client);

/* Client Login */
client.login(process.env.DISCORD_TOKEN).catch(err => {
    return console.error(`>> DISCORD LOGIN FAILED: ${err.name}: ${err.message}`);
});