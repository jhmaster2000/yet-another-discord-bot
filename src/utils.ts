import { type EscapeMarkdownOptions, escapeCodeBlock, escapeMarkdown as djsEscapeMarkdown } from 'discord.js';

export interface ExtendedEscapeMarkdownOptions extends EscapeMarkdownOptions {
    backslash?: boolean;
    maskedLink?: boolean;
    escapedLink?: boolean;
}

export default class Utils {
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
    static escapeMarkdown(text: string, options: ExtendedEscapeMarkdownOptions = {}): string {
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
        text = djsEscapeMarkdown(text, superoptions);

        options.inlineCode ??= true;
        options.codeBlock = options.inlineCode ? false : options.codeBlock ?? true;

        if (options.inlineCode) return Utils.escapeBacktick(text);
        else return options.codeBlock ? escapeCodeBlock(text) : text;
    }
}
