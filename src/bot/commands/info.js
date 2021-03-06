import Discord from 'discord.js';
import crypto from 'crypto';
import os from 'os';

export function run(client, message, args) {
    const memory = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}/${(os.totalmem() / 1024 / 1024).toFixed(1)} MB`;
    const gitHash = process.env.GIT_HASH || process.env.VERSION_TIMESTAMP;
    const versionHash = crypto.createHash('shake256', { outputLength: 4 }).update(gitHash).digest('hex').toUpperCase();
    
    const scpus = os.cpus();
    setTimeout(() => {
        let cpuUsageTotal = 0;
        const cpus = os.cpus();
        for (let c = 0, cores = cpus.length; c < cores; c++) {
            const scpu = scpus[c];
            const cpu = cpus[c];
            let stotal = 0;
            let total = 0;
            for (let type in scpu.times) stotal += scpu.times[type];
            for (let type in cpu.times) total += cpu.times[type];
            const thisCpuUsage = 100 - Math.round(100 * (cpu.times.idle - scpu.times.idle) / (total - stotal));
            cpuUsageTotal += thisCpuUsage;
        }
        const cpuUsage = Math.round(cpuUsageTotal / scpus.length) || 0;
        
        const infoEmbed = new Discord.MessageEmbed()
            .setColor(0x27d11a)
            .setTimestamp()
            .setAuthor('Bot Information', client.user.displayAvatarURL({ dynamic: true, format: 'png' }))
            .setFooter(`Developed by ${client.owner.tag}`)
            .setTimestamp()
            .addField('Version', `\`${process.env.npm_package_version}-${versionHash}\``, true)
            .addField('NodeJS', `\`v${process.versions.node}\``, true)
            .addField('Library', `\`discord.js@${Discord.version}\``, true)
            .addField('OS', `\`${process.platform} (${process.arch})\``, true)
            .addField('CPU Usage', `\`${cpuUsage}%\``, true)
            .addField('Memory Usage', `\`${memory}\``, true)
        return message.channel.send(infoEmbed);
    }, 250);
}

export const config = {
    aliases: ['botinfo', 'stats', 'botstats'],
    selfperms: ['EMBED_LINKS'],
    description: 'Displays information about the bot.'
}