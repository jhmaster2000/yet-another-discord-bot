import Bot from './Bot.js';
import { GatewayIntentBits } from 'discord.js';

/* Client Setup */
const client = new Bot({
    intents: [
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.DirectMessageReactions,
        //GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildExpressions, // Formerly GuildEmojisAndStickers
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        //GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
    ],
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
await client.login(process.env.DISCORD_TOKEN).catch((err: Error) => console.error(`>> DISCORD LOGIN FAILED: ${err.name}: ${err.message}`));
