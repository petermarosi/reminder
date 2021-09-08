const settings = require("../settings");
const installerService = require("../Services/installer");

const channelName = settings.getChannel('bot').name;
const botRoleName = settings.getRole('bot').name;
const userRoleName = settings.getRole('user').name;




const initServer = async (guild, client) => {
    return installerService.checkAndCreateRolesAndChannel(guild, client.user.id, channelName, botRoleName, userRoleName).then( result => {
        result.channels.bot.send('Bot has awakened').catch(console.error);

        return result;
    }).catch(console.error);
}

const logServers = client => {
    installerService.listServers(client);
}

exports.initServer = initServer;
exports.logServers = logServers;