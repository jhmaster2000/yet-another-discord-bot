import { pathToFileURL } from 'url';
import { readdir } from 'fs';
import { join } from 'path';

export default function loadEvents(client) {
    readdir(join(process.env.workdir, './bot/events/'), (err, files) => {
        if (err) return console.error(err);

        files = files.filter(file => file.endsWith('.js'));
        files.forEach(async file => {
            const eventName = file.split('.')[0];
            let event;
            try {
                Error.stackTraceLimit = 8;
                event = await import(pathToFileURL(join(process.env.workdir, `./bot/events/${file}`)));
            } catch (err) {
                return console.error(`EVENT_LOADER > FAILED TO LOAD: ${eventName}`, err);
            }
            client.on(eventName, (...args) => {
                try {
                    event.run(client, ...args);
                } catch (err) {
                    console.error(
                        `[EVENT_HANDLER] An error occured while running the event: "${eventName}"\n` +
                        `Event args (${args.length}): ${args.join(', ')}\nEvent error:`, err
                    );
                }
            });
            console.info(`EVENT_LOADER > Successfully loaded: ${eventName}`);
        });
    });
}