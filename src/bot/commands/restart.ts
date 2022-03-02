import { spawn } from 'child_process';
import { Message } from 'discord.js';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';

export function run(client: Bot, message: Message, args: Args) {
    void message.channel.send(`${client.em.loadingfast} Restarting...`).then(msg => {
        try {
            const newInstance = spawn('npm', ['start'], {
                cwd: process.env.workdir,
                detached: true,
                stdio: 'ignore',
                shell: true
            });
            newInstance.unref();
            console.warn(`[RESTART_SUCCESS] Successfully spawned new instance and self-terminated.`);
            return msg.edit(`${client.em.check} Restart successful. (\`${process.env.GIT_HASH!}\`)`).then(() => process.exit(600));
        } catch(err) {
            console.error('[RESTART_FAILURE]', err);
            return msg.edit(`${client.em.xmark} Failed to restart, shutdown aborted.`);
        }
    });
}

export const config = {
    userperms: ['SPECIAL:OWNER'],
    aliases: ['die', 'kys', 'rs'],
    description: 'Restart\'s the entire bot.'
};
