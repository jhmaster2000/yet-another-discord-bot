import { spawn } from 'child_process';
import ps from 'ps-node';

let runningCommands = 0;
const term = spawn('sh');
process.env.TERM_PID = term.pid;
process.env.TERM_KILL_CMD = '0';

function killRunningSubprocess(message, graceful) {
    ps.lookup({ ppid: term.pid }, (err, resultList) => {
        if (err) throw new Error(err);
        if (resultList.length === 0 && runningCommands === 0 && !graceful) return message.channel.send('`No running subprocess to kill.`');
        if (!graceful) process.env.TERM_KILL_CMD = '1';
        resultList.forEach(proc => {
            const killed = process.kill(proc.pid);
            if (killed && !graceful) return message.channel.send(`\`Killed subprocess ${proc.pid} for [${proc.command}] command.\``);
            if (!graceful) return message.channel.send(`\`Failed to terminate subprocess ${proc.pid} for [${proc.command}] command.\``);
        });
        if (!graceful && resultList.length === 0) return message.channel.send(`\`Killed all running commands.\``);
    });
}

export function run(client, message, args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} No command given. \`[Terminal PID: ${term.pid}]\``);
    args = args.basic.map(arg => arg.raw);
    if (args[0] === '^C') return killRunningSubprocess(message, false);
    if (runningCommands !== 0) return message.channel.send(`\`⚠️ A command is still running!\``);

    process.env.TERM_KILL_CMD = '0';
    runningCommands++;
    message.channel.send(`${client.em.loadingfast} Output:\n\`\`\`xl\n \n\`\`\``).then(msg => {
        const output = [`${client.em.loadingfast} Output:`, '```xl'];

        term.stdout.on('data', out => {
            output.push(out);
        });
        term.stderr.on('data', err => {
            output.push(err);
        });
        term.on('error', (error) => {
            clearInterval(timer);
            msg.delete();
            return message.channel.send(`${client.em.xmark} Failed to run command: ${error}`);
        });

        term.stdin.setEncoding('utf-8');
        term.stdin.write(`${args.join(' ')}\n`);

        ps.lookup({ ppid: term.pid }, (err, resultList) => {
            if (err) throw new Error(err);
            let time = 0;
            let timer = setInterval(() => {
                time++;
                try {
                    process.kill(resultList[0].pid, 0);
                } catch(e) {
                    return endCommand('ended');
                }
                if (process.env.TERM_KILL_CMD !== '0') return endCommand('killed');
                if (time > 300) return endCommand('timeout');
            }, 100);

            function endCommand(reason) {
                clearInterval(timer);
                if (reason === 'timeout') killRunningSubprocess(message, true);
                process.env.TERM_KILL_CMD = '0';
                runningCommands--;
                 output.shift();
                output.unshift(`${client.em.check} Output:`);
                if (output.length === 2) output.push(' ');
                output.push('```');
                if (reason === 'timeout') output.push(`\`⚠️ Command timed out.\``);
                msg.edit(output.join('\n')).catch(err => {
                    msg.delete();
                    message.channel.send(output.join('\n'), { split: { prepend: '```xl\n', append: '```' } });
                });
            }
        });
    });
}
export const config = {
    aliases: ['cli', 'term', 'terminal', 'spawn', 'console'],
    userperms: ['SPECIAL:OWNER'],
    description: 'Executes a commandline command in a persistent terminal.',
    usage: {
        args: '<...input>'
    }
}