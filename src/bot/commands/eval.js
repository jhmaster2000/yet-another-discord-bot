import util from 'util';
import * as lexure from 'lexure';

/* Quick Access Modules */
import Discord from 'discord.js';
import got from 'got';
import fs from 'fs';
import os from 'os';

export function run(client, message, args) {
    const split = args.flags.has('split') || args.flags.has('s');
    const async = args.flags.has('async') || args.flags.has('a');
    const promises = args.flags.has('promises') || args.flags.has('p');

    try {
        const code = args.ordered.map(arg => {
            let x = arg.raw + arg.trailing;
            if (arg.raw.startsWith('```js\n')) x = arg.value.slice(3);
            return x;
        }).filter(Boolean).join('');

        if (async) return asyncEval(code);
        async function asyncEval(code) {
            try {
                let asyncEvaled = '⚠️ Failed to set async return value.';
                await eval(`(async () => { ${code} } )().then(p => asyncEvaled = p);`);
                if (asyncEvaled === undefined) asyncEvaled = '⚠️ No return value.';
                if (typeof asyncEvaled !== 'string') asyncEvaled = util.inspect(asyncEvaled, false, 0);
                return message.channel.send(clean(asyncEvaled), { code: 'js', split: split }).catch(e => {
                    message.channel.send('⚠️ AsyncOutput is too long, check console for details! (or use `--split` flag)');
                    console.info(`[ASYNCEVAL_STDOUT] ${asyncEvaled}`);
                });
            } catch(err) {
                return message.channel.send(`${client.em.xmark} **AsyncError:**\n\`\`\`js\n${clean(err)}\n\`\`\``, { split: split }).catch(e => {
                    message.channel.send('⚠️ AsyncError is too long, check console for details! (or use `--split` flag)');
                    console.info(`[ASYNCEVAL_STDERR] ${err}`);
                });
            }
        }

        let evaled = eval(code);
        if (evaled instanceof Promise && !promises) {
            evaled = util.inspect(evaled, false, 0, false);
            if (evaled.includes('<pending>') || evaled.includes('{ undefined }')) return;
        }
        if (typeof evaled !== 'string') evaled = util.inspect(evaled, false, 0, false);

        return message.channel.send(clean(evaled), { code: 'js', split: split }).catch(e => {
            message.channel.send('⚠️ Output is too long, check console for details! (or use `--split` flag)');
            return console.info(`[EVAL_STDOUT] ${evaled}`);
        });
    } catch (err) {
        return message.channel.send(`${client.em.xmark} **Error:**\n\`\`\`js\n${clean(err)}\n\`\`\``, { split: split }).catch(e => {
            message.channel.send('⚠️ Error is too long, check console for details! (or use `--split` flag)');
            return console.info(`[EVAL_STDERR] ${err}`);
        });
    }
}

function clean(text) {
    if (typeof text === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
    else return text;
}

function createArgs(input) {
    if (Array.isArray(input)) input = input.join(' ');
    const createdlexer = new lexure.Lexer(input).setQuotes([[`"`,`"`],[`'`,`'`],['```','```']]).lex();
    const createdargs = new lexure.Parser(createdlexer).setUnorderedStrategy(lexure.prefixedStrategy(['--'], ['='])).parse();
    createdargs.basic = createdlexer;
    createdargs.flags = new Set([...createdargs.flags].filter(Boolean));
    createdargs.options = new Map([...createdargs.options].filter(o => o[0] && o[1].length).map(o => [o[0], o[1][o[1].length - 1]]).filter(o => o[1]));
    return createdargs;
}

export const config = {
    userperms: ['SPECIAL:OWNER'],
    description: 'Evaluates JavaScript code.',
    usage: {
        args: '[...code]',
        flags: {
            async: 'Runs the code in async context.',
            split: 'Splits the output to bypass the maximum message length.',
            promises: 'Do not suppress pending promises.',
            a: 'Shortcut for --async',
            s: 'Shortcut for --split',
            p: 'Shortcut for --promises'
        }
    }
}