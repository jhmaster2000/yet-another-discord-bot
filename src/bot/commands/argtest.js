import util from 'util';

export function run(client, message, args) {
    if (!args.basic.length) return message.channel.send(`${client.em.xmark} No arguments detected.`);
    console.info(args);

    let argsv = args.ordered.map(arg => arg.value);
    let argsr = args.ordered.map(arg => arg.raw);
    let m = ['__**Argument #N: ** value `||` raw `||` trailing__'];
    let x = 0;
    args.ordered.forEach(arg => {
        m.push(`**Argument #${x}: ** ${arg.value} \`||\` ${arg.raw} \`||\` \`${util.inspect(arg.trailing)}\``);
        x++;
    });

    if (args.flags.size) m.push(`\n**Parsed Flags: ** \`${[...args.flags].join('\` , \`')}\``);
    
    if (args.options.size) {
        let opts = [];
        [...args.options].forEach(opt => {
            opts.push(`    \`${opt[0]}\` = \`${opt[1]}\``);
        });
        m.push(`\n**Parsed Options: **\n${opts.join('\n')}`);
    }
    return message.channel.send(m.join('\n'));
}

export const config = {
    userperms: ['SPECIAL:OWNER'],
    description: 'Tests how arguments are being processed.',
    usage: {
        args: '<...arguments>'
    }
}