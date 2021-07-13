import Discord from 'discord.js';

const icons = {
    grass_block: '1',
    diamond: '2',
    diamond_sword: '3',
    creeper: '4',
    pig: '5',
    tnt: '6',
    cookie: '7',
    heart: '8',
    bed: '9',
    cake: '10',
    sign: '11',
    rail: '12',
    crafting_table: '13',
    redstone_wire: '14',
    fire: '15',
    cobweb: '16',
    chest: '17',
    lit_furnace: '18',
    book: '19',
    stone: '20',
    planks: '21',
    iron_ingot: '22',
    gold_ingot: '23',
    wood_door: '24',
    iron_door: '25',
    diamond_chestplate: '26',
    flint_and_steel: '27',
    water_bottle: '28',
    splash_potion: '29',
    creeper_egg: '30',
    coal: '31',
    iron_sword: '32',
    bow: '33',
    arrow: '34',
    iron_chestplate: '35',
    bucket: '36',
    water_bucket: '37',
    lava_bucket: '38',
    milk_bucket: '39'
}

export function run(client, message, args) {
    const argsr = args.ordered.map(arg => arg.raw);
    let achName = encodeURIComponent(argsr.join(' ')).replace(/\'/g, '%27').replace(/\%2f/gi, '+');
    if (!argsr.length) achName = '+';
    if (argsr.join(' ').length > 24) return message.channel.send(`${client.em.xmark} Achievement is too long! Maximum is 24 characters.`);

    let title = args.options.get('title') || 'Achievement Get!';
    if (title.length > 24) return message.channel.send(`${client.em.xmark} Title is too long! Maximum is 24 characters.`);
    title = encodeURIComponent(title).replace(/\'/g, '%27').replace(/\%2f/gi, '+');

    let icon = args.options.get('icon') || '1';
    if (isNaN(icon)) icon = icons[icon] || '1';

    const img = `https://minecraftskinstealer.com/achievement/${icon}/${title}/${achName}`;
    const achievement = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setImage(img);
    return message.channel.send(achievement);
}

export const config = {
    aliases: ['ach', 'adv', 'advancement'],
    selfperms: ['EMBED_LINKS'],
    description: 'Generate a Minecraft achievement image.',
    usage: {
        args: '[...achievement_name]',
        options: {
            title: {
                value: '"<...text>"',
                info: 'Replace the "Achievement Get!" text with something else.'
            },
            icon: {
                value: '<1-39>',
                info: 'Change the achievement icon.'
            }
        }
    }
}