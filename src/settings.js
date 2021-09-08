let settings = require("./resources/defaultsettings.json");

function get() {
    return settings;
}

function getChannels() {
    return settings.channels;
}

function getChannel(type) {
    return settings.channels[type];
}

function getRoles() {
    return settings.roles;
}

function getRole(type) {
    return settings.roles[type];
}

exports.get = get;
exports.getChannels = getChannels;
exports.getChannel = getChannel;
exports.getRoles = getRoles;
exports.getRole = getRole;
//exports.set = set;