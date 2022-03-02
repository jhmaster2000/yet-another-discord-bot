/* eslint-disable @typescript-eslint/no-unused-vars */
import util from 'util';
import * as lexure from 'lexure';
import Bot from '../Bot.js';
import { Args } from '../events/messageCreate.js';
import { Message } from 'discord.js';

/* Quick Access Modules */
import Discord from 'discord.js';
import got from 'got';
import fs from 'fs';
import os from 'os';
import Utils from '../../utils.js';

export async function run(client: Bot, message: Message, args: Args) {
    const split = args.flags.has('split') || args.flags.has('s');
    const async = args.flags.has('async') || args.flags.has('a');
    const promises = args.flags.has('promises') || args.flags.has('p');
    const depth = Number(args.options.get('depth')) || Number(args.options.get('d')) || 0;

    try {
        const code = args.ordered.map(arg => {
            let x = arg.raw + arg.trailing;
            if (arg.raw.startsWith('```js\n')) x = arg.value.slice(3);
            return x;
        }).filter(Boolean).join('');

        if (async) return asyncEval(code);
        // eslint-disable-next-line no-inner-declarations
        async function asyncEval(code: string) {
            try {
                let asyncEvaled = '⚠️ Failed to set async return value.';
                await eval(`(async () => { ${code} } )().then(p => asyncEvaled = p);`);
                if (asyncEvaled === undefined) asyncEvaled = '⚠️ No return value.';
                if (typeof asyncEvaled !== 'string') asyncEvaled = util.inspect(asyncEvaled, false, depth, false);
                if (split) {
                    for (const m of Utils.splitMessage('```js\n'+clean(asyncEvaled)+'\n```', { char: /\n|./, prepend: '```js\n', append: '```' })) {
                        await message.channel.send(m);
                    }
                    return;
                } else {
                    return message.channel.send('```js\n'+clean(asyncEvaled)+'\n```').catch(() => {
                        void message.channel.send('⚠️ AsyncOutput is too long, check console for details! (or use `--split` flag)');
                        console.info(`[ASYNCEVAL_STDOUT] ${asyncEvaled}`);
                    });
                }
            } catch(e) {
                const err = e as Error;
                if (split) {
                    for (const m of Utils.splitMessage(`${client.em.xmark} **AsyncError:**\n\`\`\`js\n${clean(err)}\n\`\`\``, { char: /\n|./, prepend: '```js\n', append: '```' })) {
                        await message.channel.send(m);
                    }
                    return;
                } else {
                    return message.channel.send(`${client.em.xmark} **AsyncError:**\n\`\`\`js\n${clean(err)}\n\`\`\``).catch(__e => {
                        void message.channel.send('⚠️ AsyncError is too long, check console for details! (or use `--split` flag)');
                        console.info(`[ASYNCEVAL_STDERR] ${err.toString()}`);
                    });
                }
            }
        }

        let evaled: unknown = eval(code);
        if (evaled instanceof Promise && !promises) {
            evaled = util.inspect(evaled, false, depth, false);
            if ((<string>evaled).includes('<pending>') || (<string>evaled).includes('{ undefined }')) return;
        }
        if (typeof evaled !== 'string') evaled = util.inspect(evaled, false, depth, false);

        if (split) {
            for (const m of Utils.splitMessage('```js\n'+clean(evaled)+'\n```', { char: /\n|./, prepend: '```js\n', append: '```' })) {
                await message.channel.send(m);
            }
            return;
        } else {
            return message.channel.send('```js\n'+clean(evaled)+'\n```').catch(e => {
                void message.channel.send('⚠️ Output is too long, check console for details! (or use `--split` flag)');
                return console.info(`[EVAL_STDOUT] ${evaled as string}`);
            });
        }
    } catch (err) {
        if (split) {
            for (const m of Utils.splitMessage(`${client.em.xmark} **Error:**\n\`\`\`js\n${clean(err)}\n\`\`\``, { char: /\n|./, prepend: '```js\n', append: '```' })) {
                await message.channel.send(m);
            }
            return;
        } else {
            return message.channel.send(`${client.em.xmark} **Error:**\n\`\`\`js\n${clean(err)}\n\`\`\``).catch(e => {
                void message.channel.send('⚠️ Error is too long, check console for details! (or use `--split` flag)');
                return console.info(`[EVAL_STDERR] ${err as string}`);
            });
        }
    }
}

function clean(text: unknown): string {
    if (typeof text === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
    else return String(text);
}

function createArgs(input: string | string[] | undefined): Args {
    if (Array.isArray(input)) input = input.join(' ');
    const createdlexer = new lexure.Lexer(input).setQuotes([[`"`,`"`],[`'`,`'`],['```','```']]).lex();
    const createdargs = new lexure.Parser(createdlexer).setUnorderedStrategy(lexure.prefixedStrategy(['--'], ['='])).parse() as unknown as Args;
    createdargs.basic = createdlexer;
    createdargs.flags = new Set([...createdargs.flags].filter(Boolean));
    createdargs.options = new Map(
        ([...createdargs.options as unknown as Map<string, string[]>].filter(o => o[0] && o[1].length)
        .map(o => [o[0], o[1][o[1].length - 1]]) as unknown as [string, string][]).filter(o => o[1])
    );
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
        },
        options: {
            depth: {
                value: '<depth>',
                info: 'Depth to inspect the output. (Default: 0)'
            },
            d: {
                value: '<depth>',
                info: 'Shortcut for --depth'
            }
        }
    }
}
