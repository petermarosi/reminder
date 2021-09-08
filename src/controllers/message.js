const messageService = require("../Services/message");

let botChannel;
let userRole;
const data = {
    'embed': require("../resources/embeddata.json"),
    'dailies': require("../resources/dailies.json"),
    'reactionNumbers': require("../resources/reactionnumbers.json"),
};

const init = (channel, role) => {
    botChannel = channel;
    userRole = role;
}

const subscription = async () => {
    return await messageService.handleEmbedMessage(botChannel, data, 'subscription', userRole).catch(console.error);
};

const checkIn = async () => {
    return await messageService.handleEmbedMessage(botChannel, data, 'checkIn', userRole).catch(console.error);
};

const install = async (channel) => {
    return await messageService.handleEmbedMessage(channel, data, 'install').catch(console.error);
}

const reminder = async () => {
    messageService.mention(botChannel, userRole).catch(console.error);
};

const reactionRemoval = async (messageReaction, user) => {
    if (botChannel && userRole) {
        messageService.handleReactionRemovals(messageReaction, user.id, botChannel, userRole).catch(console.error);
    }

};

exports.init = init;
exports.subscription = subscription;
exports.checkIn = checkIn;
exports.install = install;
exports.reminder = reminder;
exports.reactionRemoval = reactionRemoval;