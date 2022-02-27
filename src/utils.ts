//import fs from 'fs';
//import got from 'got';
//import { join } from 'path';
import { EscapeMarkdownOptions, Util } from 'discord.js';

export interface ExtendedEscapeMarkdownOptions extends EscapeMarkdownOptions {
    backslash?: boolean;
    maskedLink?: boolean;
    escapedLink?: boolean;
}

//@ts-expect-error - Discord.js decided to make Util constructor private for some stupid reason.
export default class Utils extends Util {
    static escapeRegex(str: string): string {
        return str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }
    static escapeBacktick(text: string, useZWS: boolean = false): string {
        return text.replace(/`/g, useZWS ? '\u200B`' : '\\`');
    }
    static escapeBackslash(text: string): string {
        return text.replace(/\\/g, '\\\\');
    }
    static escapeMaskedLink(text: string): string {
        return text.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    }
    static escapeEscapedLink(text: string): string {
        return text.replace(/</g, '\\<').replace(/>/g, '\\>');
    }
    static override escapeMarkdown(text: string, options: ExtendedEscapeMarkdownOptions = {}): string {
        if (options.backslash ?? true) text = Utils.escapeBackslash(text);
        if (options.maskedLink ?? true) text = Utils.escapeMaskedLink(text);
        if (options.escapedLink ?? true) text = Utils.escapeEscapedLink(text);

        const superoptions: EscapeMarkdownOptions = {
            bold: options.bold ??= true,
            italic: options.italic ??= true,
            underline: options.underline ??= true,
            strikethrough: options.strikethrough ??= true,
            spoiler: options.spoiler ??= true,
            codeBlock: false,
            inlineCode: false,
            codeBlockContent: options.codeBlockContent ??= true,
            inlineCodeContent: options.inlineCodeContent ??= true
        };
        text = super.escapeMarkdown(text, superoptions);

        options.inlineCode ??= true;
        options.codeBlock = options.inlineCode ? false : options.codeBlock ?? true;

        if (options.inlineCode) return Utils.escapeBacktick(text);
        else return options.codeBlock ? this.escapeCodeBlock(text) : text;
    }
}

/* IANA TLD list fetcher (unused)  */
//got.get('https://data.iana.org/TLD/tlds-alpha-by-domain.txt').then(response => {
//    const listData = response.body.split('\n');
//    const listVersion = listData.shift()!.slice(2);
//    listData.pop();
//    if (!fs.existsSync(join(process.env.workdir!, './bot/assets'))) fs.mkdirSync(join(process.env.workdir!, './bot/assets'));
//    fs.writeFileSync(join(process.env.workdir!, './bot/assets/tlds.json'), JSON.stringify({ version: listVersion, tlds: listData }));
//});
