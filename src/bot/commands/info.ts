import Discord, { Message } from 'discord.js';
import crypto from 'crypto';
import os from 'os';
import Bot from '../Bot.js';
import { type Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, args: Args) {
    const memory = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}/${(os.totalmem() / 1024 / 1024).toFixed(1)} MB`;
    const gitHash = process.env.GIT_HASH || process.env.VERSION_TIMESTAMP;
    const versionHash = crypto.createHash('shake256', { outputLength: 4 }).update(gitHash!).digest('hex').toUpperCase();
    
    const scpus = os.cpus();
    setTimeout(() => {
        let cpuUsageTotal = 0;
        const cpus = os.cpus();
        for (let c = 0, cores = cpus.length; c < cores; c++) {
            const scpu = scpus[c];
            const cpu = cpus[c];
            let stotal = 0;
            let total = 0;
            for (let type in scpu.times) stotal += scpu.times[type as keyof typeof scpu.times];
            for (let type in cpu.times) total += cpu.times[type as keyof typeof cpu.times];
            const thisCpuUsage = 100 - Math.round(100 * (cpu.times.idle - scpu.times.idle) / (total - stotal));
            cpuUsageTotal += thisCpuUsage;
        }
        const cpuUsage = Math.round(cpuUsageTotal / scpus.length) || 0;
        
        const infoEmbed = new Discord.EmbedBuilder()
            .setColor(0x27D11A)
            .setTimestamp()
            .setAuthor({ name: 'Bot Information', iconURL: client.user!.displayAvatarURL({ extension: 'png' }) })
            .setFooter({ text: `Developed by ${client.owner.tag}` })
            .setTimestamp()
            .addFields(
                { name: 'Version', value: `\`${process.env.npm_package_version!}-${versionHash}\``, inline: true },
                { name: 'NodeJS', value: `\`v${process.versions.node}\``, inline: true },
                { name: 'Library', value: `\`discord.js@${Discord.version}\``, inline: true },
                { name: 'OS', value: `\`${process.platform} (${process.arch})\``, inline: true },
                { name: 'CPU Usage', value: `\`${cpuUsage}%\``, inline: true },
                { name: 'Memory Usage', value: `\`${memory}\``, inline: true },
            );
        return message.channel.send({ embeds: [infoEmbed] });
    }, 250);
}

export const config = {
    aliases: ['botinfo', 'stats', 'botstats'],
    selfperms: ['EMBED_LINKS'],
    description: 'Displays information about the bot.'
}
