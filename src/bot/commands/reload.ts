import { Message } from 'discord.js';
import { join } from 'path';
import { pathToFileURL } from 'url';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export async function run(client: Bot, message: Message, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`${client.em.xmark} No command to reload was given.`);
    const args = argsx.basic.map(arg => arg.value);

    const cmdName = client.commandAliases.get(args[0]) || args[0];
    try {
        const command = await import(pathToFileURL(join(process.env.workdir!, `./bot/commands/${cmdName}.js`)).href);
        command.config.name = cmdName;
        client.commands.set(cmdName, command);
        client.commandAliases.sweep(cmd => cmd === cmdName);
        if (command.config.aliases) command.config.aliases.forEach((alias: string) => client.commandAliases.set(alias, cmdName));
        return message.channel.send(`${client.em.check} Command \`${cmdName}\` was successfully reloaded.`);
    } catch (err: any) {
        if (err.code == 'ERR_MODULE_NOT_FOUND') return message.channel.send(`${client.em.xmark} Command not found.`);
        console.error(`RELOAD_COMMAND > Failed to reload '${cmdName}.js'`, err);
        return message.channel.send(`${client.em.xmark} An unexpected error occured when trying to reload \`${cmdName}.js\`\n\`\`\`xl\n${err}\n\`\`\``);
    }
}

export const config = {
    aliases: ['rl', 'refresh', 'rf'],
    userperms: ['SPECIAL:OWNER'],
    description: 'Reloads a command.',
    deprecated: true,
    disabled: true, // TODO: Restore this command if possible
    usage: {
        args: '<command>'
    }
}
