const utils = require("../utils");

const result = {
    'channels': {},
    'roles': {},
}

async function checkAndCreateRolesAndChannel(guild, clientUserId, channelName, botRoleName, userRoleName) {
    const bot = guild.members.cache.find(member => member.id === clientUserId);

    return Promise.all([
        checkAndCreateRole(guild, botRoleName, 'BLUE', bot),
        checkAndCreateRole(guild, userRoleName, 'BLUE')
    ]).then( roles => {
        return checkAndCreateBotChannel(guild, channelName, roles);
    }).catch(console.error);
}

async function checkAndCreateRole(guild, roleName, roleColor, target) {
    const role = utils.findItemByName(guild.roles.cache, roleName);
    if (role) {
        if (target && !utils.findItemByName(target.roles.cache, roleName)) {
            target.roles.add(role).catch(console.error);
        }

        return role;
    }

    return guild.roles.create({
        data: {
            name: roleName,
            color: roleColor,
        }
    }).then( createdRole => {
        if (target) {
            target.roles.add(createdRole).catch(console.error);
        }

        return createdRole;
    }).catch(console.error);
}

async function checkAndCreateBotChannel(guild, channelName, roles) {
    const channel = utils.findItemByName(guild.channels.cache, channelName);

    if (channel) {
        makeResult(channel, roles);

        return result;
    }

    return guild.channels.create(channelName,{
        type: 'text',
        permissionOverwrites: [
            {
                id: guild.id,
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS'],
            },
            {
                id: roles[0].id,
                type: 'role',
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
            },
            {
                id: roles[1].id,
                type: 'role',
                allow: ['VIEW_CHANNEL'],
            }
        ]
    }).then( createdChannel => {
        makeResult(createdChannel, roles);

        return result;
    }).catch(console.error);
}

function makeResult(channel, roles) {
    result.channels.bot = channel;
    result.roles.bot = roles[0];
    result.roles.user = roles[1];
}

function listServers(client) {
    console.log("Servers:");
    client.guilds.cache.forEach((guild) => {
        console.log(" - " + guild.name);

        // List all channels
        guild.channels.cache.forEach((channel) => {
            console.log(` -- ${ channel.name } (${ channel.type }) - ${ channel.id }`)
        });
    })
}

exports.checkAndCreateRolesAndChannel = checkAndCreateRolesAndChannel;
exports.listServers = listServers;