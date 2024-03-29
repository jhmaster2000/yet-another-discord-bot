import Discord, { Message } from 'discord.js';
import Bot from '../Bot.js';
import type Command from '../Command.js';
import { type Args } from '../events/messageCreate.js';
import { checkPermissions } from '../permissionsHandler.js';

export function run(client: Bot, message: Message, args: Args) {
    const commands = client.commands;
    const command = args.ordered.length ? args.ordered[0].value : null;
    const helpEmbed = new Discord.EmbedBuilder();

    if (!command) {
        const help = [];
        help.push(`\`\`${commands.filter(cmd => !cmd.config.disabled).map(cmd => cmd.config.name).sort().join('``, ``')}\`\``);
        help.push(`\n*Use **\`\`${client.prefixes[0]} help [command]\`\`** to get info on a specific command.*`);
        helpEmbed.setTitle('Here\'s a list of all the commands:').setColor(0x24C0FA).setDescription(help.join('')).setTimestamp()
                 .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ extension: 'png' }) });
        return sendHelp(helpEmbed);
    }
    if (!commands.has(command) && !client.commandAliases.has(command)) return message.channel.send(`${client.em.xmark} \`\`${command}\`\` is not a valid command. (Try **\`\`${client.prefixes[0]} help\`\`** for a list of valid commands)`);
    
    const cmd = commands.get(command) || commands.get(client.commandAliases.get(command)!)!;
    const helpDescription = [], helpUsage = [], helpRequirements = [];

                                   helpDescription.push(`**Description:** ${cmd.config.description || 'No description'}`);
    if (cmd.config.aliases)        helpDescription.push(`**Aliases:** \`${cmd.config.aliases.join('`, `')}\``);

                                   helpUsage.push(`**Arguments:** ${cmd.config.usage?.args ? '`' + cmd.config.usage.args + '`' : 'None'}`);
    if (cmd.config.usage?.flags)   helpUsage.push(`**Flags:**\n${helpFlags(cmd)}`);
    if (cmd.config.usage?.options) helpUsage.push(`**Options:**\n${helpOptions(cmd)}`);
    
    if (cmd.config.userperms)      helpRequirements.push(`**User Permissions:** \`${cmd.config.userperms.join('`, `')}\``);
    if (cmd.config.selfperms)      helpRequirements.push(`**Bot Permissions:** \`${cmd.config.selfperms.join('`, `')}\``);

    let usableMsg = 'You can use this command in this server';
    const usable = !checkPermissions(client, message, cmd, true).code;
    let helpColor = 0x00FF00;
    if (!usable) {
        helpColor = 0xFF0000;
        usableMsg = 'You don\'t have permission to use this command in this server';
    }
    if (cmd.config.deprecated) {
        helpColor = 0xFFFF00;
        usableMsg = 'This command is deprecated and will be removed soon';
    }
    if (cmd.config.disabled) {
        helpColor = 0xFF0000;
        usableMsg = 'This command is currently disabled';
    }

    helpEmbed.setTitle(`Command Help: \`${cmd.config.name}\``).setColor(helpColor).setTimestamp();
    helpEmbed.setFooter({ text: usableMsg, iconURL: message.author.displayAvatarURL({ extension: 'png' }) });
    if (helpDescription.length)  helpEmbed.setDescription(helpDescription.join('\n'));
    if (helpUsage.length)        helpEmbed.addFields({ name: '**__Usage__**', value: helpUsage.join('\n') });
    if (helpRequirements.length) helpEmbed.addFields({ name: '**__Requirements__**', value: helpRequirements.join('\n') });
    return sendHelp(helpEmbed);

    function sendHelp(embed: Discord.EmbedBuilder) { return message.channel.send({ embeds: [embed] }); }
}

function helpFlags(cmd: Command): string {
    let flags = [];
    for (const flag in cmd.config.usage!.flags) {
        const flagInfo = cmd.config.usage!.flags[flag];
        flags.push(`• \`--${flag}\`: ${flagInfo}`);
    }
    return flags.join('\n');
}

function helpOptions(cmd: Command): string {
    let options = [];
    for (const option in cmd.config.usage!.options) {
        const optionInfo = cmd.config.usage!.options[option].info;
        const optionValue = cmd.config.usage!.options[option].value;
        options.push(`• \`--${option}=${optionValue}\`: ${optionInfo}`);
    }
    return options.join('\n');
}

export const config = {
    selfperms: ['EMBED_LINKS'],
    description: 'Displays a list of all the bot\'s commands or gives detailed information on a specific command.',
    usage: {
        args: '[command]'
    }
}
