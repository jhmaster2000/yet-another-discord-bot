import Discord, { Message } from 'discord.js';
import got from 'got';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, args: Args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} First argument must be either \`create\` or \`scan\`. Check \`${client.prefixes[0]} help qr\` for reference.`);
    const argsr = args.ordered.map(arg => arg.raw + arg.trailing);
    const subcommand = argsr.shift()!.trim();

    if (subcommand === 'create') {
        const qrData = argsr.join('');
        if (!qrData) return message.channel.send(`${client.em.xmark} You need to provide something to put on the QR code.`);
        const qrEmbed = new Discord.MessageEmbed()
            .setColor(0x00FF00)
            .setTitle('QR Code generated!')
            .setImage(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=256x256`)
            .setFooter(`Generated by ${message.author.username}`, message.author.avatarURL() ?? undefined)
            .setTimestamp();
        return message.channel.send({ embeds: [qrEmbed] });
    }

    if (subcommand === 'scan') {
        const qrLink = argsr[0];
        if (!qrLink) return message.channel.send(`${client.em.xmark} Please provide an image URL with a QR code on it to be scanned!`);

        return message.channel.send(`${client.em.loadingfast} **Scanning QR Code...**`).then(msg => {
            return got.get(`https://api.qrserver.com/v1/read-qr-code/?fileurl=${encodeURIComponent(qrLink)}`, { timeout: { request: 15000 }, retry: { limit: 0 } }).then(response => {
                const scanned = JSON.parse(response.body)[0].symbol[0];
                //@ts-ignore // TODO: Refer to sideloadUtils.ts
                let result = `${client.em.check} **QR Scan Result:**\n${RegExp.escapeMarkdown(scanned.data)}`;

                if (!scanned.data) result = `${client.em.xmark} **QR Scan Error:** \`\`\`js\n${scanned.error}\`\`\``;
                if (scanned.error?.includes('download error')) result = `${client.em.xmark} That is not a valid image URL. (Download error)`;

                return msg.edit(result);
            }).catch(err => {
                if (err.code === 'ETIMEDOUT') return msg.edit(`${client.em.xmark} That is not a valid image URL. (Timed out)`);
                if (err.statusCode === 400) return msg.edit(`${client.em.xmark} That is not a valid image URL.`);
                console.error(err);
                return msg.edit(`${client.em.xmark} **QR Scan Fatal Error:** \`\`\`js\n${err}\`\`\``);
            });
        });
    }
    if (!['create', 'scan'].includes(subcommand)) return message.channel.send(`${client.em.xmark} First argument must be either \`create\` or \`scan\`. Check \`${client.prefixes[0]} help qr\` for reference.`);
    else return;
}

export const config = {
    aliases: ['qr'],
    selfperms: ['EMBED_LINKS'],
    description: 'Creates and scans QR code images.',
    usage: {
        args: '<create/scan> (create: <...text> | scan: <image_link>)'
    }
};
