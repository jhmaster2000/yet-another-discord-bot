export function run(client, debug) {    
    if (process.env.LOGLEVEL >= 4) return console.debug(debug);

    /*return Promise.resolve({
        event: 'debug',
        this: this
    });*/
}