import Bot from './Bot.js';
const ALL_INTENTS = 32767 as const;
Error.stackTraceLimit = Number(process.env.STACKTRACE_LIMIT);

/* Client Setup */
const client = new Bot({
    intents: ALL_INTENTS,
    allowedMentions: {
        parse: ['users'],
        repliedUser: false
    }
});

import loadCustomEmojis from './loadCustomEmojis.js'; loadCustomEmojis(client);
import loadCommands from './loadCommands.js'; loadCommands(client);
import loadEvents from './loadEvents.js'; loadEvents(client);
import loadPaginator from './paginator.js'; loadPaginator(client);
import loadReactionListener from './reactionListener.js'; loadReactionListener(client);

/* Client Login */
client.login(process.env.DISCORD_TOKEN).catch((err: Error) => console.error(`>> DISCORD LOGIN FAILED: ${err.name}: ${err.message}`));
