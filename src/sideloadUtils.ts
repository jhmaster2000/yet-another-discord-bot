import fs from 'fs';
import got from 'got';
import { join } from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/* child_process.spawn debugger utility */
(function () {
    let childProcess = require('child_process');
    let oldSpawn = childProcess.spawn;
    function newSpawn(this: any) {
        if (Number(process.env.LOGLEVEL) >= 3) console.info('spawn called:', arguments);
        return oldSpawn.apply(this, arguments);
    }
    childProcess.spawn = newSpawn;
})();


/* Regex String Escaper */ //@ts-ignore // TODO: Make this TypeScript compliant
RegExp.quote = (str) => {
    return str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
}

/* Regex Discord Markdown Escapers */ //@ts-ignore // TODO: Make this TypeScript compliant
RegExp.escapeMarkdown = (text) => {
    text = String(text);
    if (!text) return null;
    return text.replace(/\\/g, '\\\\').replace(/_/g, '\\_').replace(/\*/g, '\\*').replace(/\[/g, '\\[').replace(/\]/g, '\\]')
               .replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/</g, '\\<').replace(/>/g, '\\>').replace(/`/g, '\\`');
}
//@ts-ignore
RegExp.escapeBacktick = (text) => {
    return text.replace(/`/g, '​`'); // Prepends ZWS
}

/* IANA TLD list fetcher  */
got.get('https://data.iana.org/TLD/tlds-alpha-by-domain.txt').then(response => {
    const listData = response.body.split('\n');
    const listVersion = listData.shift()!.slice(2);
    listData.pop();
    fs.writeFileSync(join(process.env.workdir!, './bot/assets/tlds.json'), JSON.stringify({ version: listVersion, tlds: listData }));
});
