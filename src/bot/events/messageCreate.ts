import { type GuildChannelResolvable, Message } from 'discord.js';
import * as lexure from 'lexure';
import Bot from '../Bot.js';
import { checkPermissions } from '../permissionsHandler.js';

export interface Args {
    ordered: lexure.Token[];
    flags: Set<string>;
    options: Map<string, string>;
    basic: lexure.Token[];
}

export async function run(client: Bot, message: Message) {
    if (message.author.bot) return;
    if (!message.guild) return message.reply(`${client.em.xmark} Commands can't be used on DMs.`);
    if (!message.guild.members.me!.permissionsIn(<GuildChannelResolvable>message.channel).has('SendMessages')) return;

    let prefix = '';
    for (const thisPrefix of client.prefixes) {
        if (message.content.toLowerCase().startsWith(thisPrefix)) prefix = thisPrefix;
    }
    if (!prefix) return;

    const input = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmdName = input.shift()!.toLowerCase();
    const command = client.commands.get(cmdName) || client.commands.get(client.commandAliases.get(cmdName)!);
    if (!command) return;

    if (command.config.disabled) return message.channel.send(`${client.em.xmark} This command is currently disabled.`);

    /* Permissions Handler */
    if (!message.guild.members.me!.permissionsIn(<GuildChannelResolvable>message.channel).has('UseExternalEmojis')) return message.channel.send('The bot is missing the **Use External Emoji** permission, which is required to function properly.');
    const permissions = checkPermissions(client, message, command);
    if (permissions.code) return;
    
    /* Arguments Handler */
    const lexer = new lexure.Lexer(input.join(' ')).setQuotes([[`"`,`"`],[`'`,`'`],['```','```']]).lex();
    const args = new lexure.Parser(lexer).setUnorderedStrategy(lexure.prefixedStrategy(['--'], ['='])).parse() as unknown as Args;
    args.basic = lexer;
    args.flags = new Set([...args.flags].filter(Boolean));
    args.options = new Map(
        ([...args.options as unknown as Map<string, string[]>].filter(o => o[0] && o[1].length)
        .map(o => [o[0], o[1].at(-1)]) as unknown as [string, string][]).filter(o => o[1])
    );

    /* Command Handler */
    try {
        Error.stackTraceLimit = Number(process.env.STACKTRACE_LIMIT);
        return await command.run(client, message, args);
    } catch (err) {
        if (Number(process.env.LOGLEVEL) >= 2) void message.react(client.re.critical);
        if (Number(process.env.LOGLEVEL) >= 3) void message.channel.send(
            `${client.em.critical} An unexpected error occured trying to run this command:` +
            `\n\`\`\`xl\n${String(err)}\n\`\`\`(This did not crash the bot)`
        );
        return console.error(`[FAILED_COMMAND] Command: ${message.content}\nStacktrace:`, err);
    }
}
