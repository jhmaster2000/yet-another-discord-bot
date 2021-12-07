import Discord from 'discord.js';
import { pathToFileURL } from 'url';
import { readdir } from 'fs';
import { join } from 'path';
import Bot from './Bot.js';

export default function loadCommands(client: Bot): void {
    client.commands = new Discord.Collection();
    client.commandAliases = new Discord.Collection();

    readdir(join(process.env.workdir!, './bot/commands/'), (err, files) => {
        if (err) return console.error(err);

        files = files.filter(file => file.endsWith('.js') || file.endsWith('.ts'));
        files.forEach(async (file) => {
            const commandName = file.split('.')[0];
            let command;
            try {
                Error.stackTraceLimit = 0;
                command = await import(pathToFileURL(join(process.env.workdir!, `./bot/commands/${file}`)).href);
            } catch (err) {
                return console.error(`COMMAND_LOADER > FAILED TO LOAD: ${commandName}`, err);
            }
            command.config.name = commandName;
            client.commands.set(commandName, command);
            console.info(`COMMAND_LOADER > Successfully loaded: ${commandName}`);

            /* Load Aliases */
            if (!command.config.aliases) return;
            command.config.aliases.forEach((alias: string) => {
                client.commandAliases.set(alias, commandName);
            });
        });
    });
}
