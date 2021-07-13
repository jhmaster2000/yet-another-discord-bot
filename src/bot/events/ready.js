export function run(client) {
    const events = client._eventsCount;
    const commands = client.commands.size;

    if (process.env.PRODUCTION) setInterval(() => {
        let presences = [
            `${client.prefixes[0]} help | ${client.guilds.cache.size} Servers!`,
            `${client.prefixes[0]} help | ${client.channels.cache.size} Channels!`,
            `${client.prefixes[0]} help | ${client.users.cache.size} Users!`
        ];
        client.user.setActivity(presences[Math.floor(Math.random() * presences.length)], {
            type: 'WATCHING'
        }).then(presence => {
            client.user.setPresence(presence);
        });
    }, 20000);

    client.owner = client.users.cache.get(process.env.OWNER_ID);
    if (!client.owner) {
        client.owner = client.user;
        console.warn('!!! Failed to fetch owner ID, assigning owner with self as fallback!');
    }

    client.events = client._events;
    client.eventsCount = client._eventsCount;

    delete process.env.DISCORD_TOKEN;
    return console.info(`>> Logged in as ${client.user.tag} with ${commands} commands and ${events} events!`);
}