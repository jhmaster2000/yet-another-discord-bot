export function run(client, warn) {
    if (process.env.LOGLEVEL >= 2) return console.warn(warn);
}