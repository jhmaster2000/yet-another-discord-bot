import { join } from 'path';
import { pathToFileURL } from 'url';

export async function run(client, message, args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} No command to reload was given.`);
    args = args.basic.map(arg => arg.value);

    const cmdName = client.commandAliases.get(args[0]) || args[0];
    try {
        const command = await import(pathToFileURL(join(process.env.workdir, `./bot/commands/${cmdName}.js`)));
        command.config.name = cmdName;
        client.commands.set(cmdName, command);
        client.commandAliases.sweep(cmd => cmd === cmdName);
        if (command.config.aliases) command.config.aliases.forEach(alias => client.commandAliases.set(alias, cmdName));
        return message.channel.send(`${client.em.check} Command \`${cmdName}\` was successfully reloaded.`);
    } catch (err) {
        if (err.code == 'ERR_MODULE_NOT_FOUND') return message.channel.send(`${client.em.xmark} Command not found.`);
        console.error(`RELOAD_COMMAND > Failed to reload '${cmdName}.js'`, err);
        return message.channel.send(`${client.em.xmark} An unexpected error occured when trying to reload \`${cmdName}.js\`\n\`\`\`xl\n${err}\n\`\`\``);
    }
}

export const config = {
    aliases: ['rl', 'refresh', 'rf'],
    userperms: ['SPECIAL:OWNER'],
    description: 'Reloads a command.',
    usage: {
        args: '<command>'
    }
}