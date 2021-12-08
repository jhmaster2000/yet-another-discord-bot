import { exec } from 'child_process';
import util from 'util';
import ps from 'ps-node';
import Bot from '../Bot.js';
import { Message } from 'discord.js';
import { Args } from '../events/message.js';
process.env.RUNNING_EXEC_PIDS = '[]';

function killRunningSubprocesses(message: Message): Promise<Message> | undefined {
    const runningExecPIDs = JSON.parse(process.env.RUNNING_EXEC_PIDS!);
    if (runningExecPIDs.length === 0) return message.channel.send('`No running commands to kill.`');
    runningExecPIDs.forEach((pid: number) => {
        ps.lookup({ ppid: pid }, (err, resultList) => {
            if (err) throw err;
            const proc = resultList[0];
            if (!proc) return message.channel.send(`\`Failed to locate subprocess of ${pid}. Try again.\``);
            const killed = process.kill(proc.pid);
            if (killed) return message.channel.send(`\`Killed subprocess ${proc.pid} for [${proc.command}] command.\``);
            else return message.channel.send(`\`Failed to kill subprocess ${proc.pid} for [${proc.command}] command.\``);
        });
    });
}

export function run(client: Bot, message: Message, argsx: Args) {
    if (!argsx.basic.length) return message.channel.send(`${client.em.xmark} No command given.`);
    const args = argsx.basic.map(arg => arg.raw);
    if (args[0] === '^C') return killRunningSubprocesses(message);

    message.channel.send(`${client.em.loadingfast} Output:\n\`\`\`xl\n \`\`\``).then(msg => {
        const output = [`${client.em.loadingfast} Output:`, '```xl'];
        const cmd = exec(args.join(' '), { timeout: 30000 }, (error, stdout, stderr) => {
            const runningExecPIDs = JSON.parse(process.env.RUNNING_EXEC_PIDS!);
            process.env.RUNNING_EXEC_PIDS = util.inspect(runningExecPIDs.filter((pid: number): boolean => pid !== cmd.pid));
            let exitstate = client.em.xmark;
            if (!error) exitstate = client.em.check;
            output.shift();
            output.unshift(`${exitstate} Output:`);
            if (stdout) output.push(stdout);
            if (stderr) output.push(stderr);
            if (output.length === 2) output.push(' ');
            output.push('```');
            if (error?.code === null) output.push(`\`⚠️ Command timed out.\``);
            if (error?.code !== undefined) output.push(`\`Command exited with code ${error?.code}\``);
            msg.edit(output.join('\n')).catch(err => {
                msg.delete();
                message.channel.send(output.join('\n'), { split: { prepend: '```xl\n', append: '```' } });
            });
        });
        let runningExecPIDs = JSON.parse(process.env.RUNNING_EXEC_PIDS!);
        runningExecPIDs.push(cmd.pid);
        process.env.RUNNING_EXEC_PIDS = util.inspect(runningExecPIDs);
    });
}

export const config = {
    aliases: ['exec', 'cmd', 'bash', 'run'],
    userperms: ['SPECIAL:OWNER'],
    description: 'Executes a commandline command in a temporary terminal.',
    usage: {
        args: '<...input>'
    }
}
