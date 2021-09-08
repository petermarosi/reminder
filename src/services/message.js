const Discord = require('discord.js');

const utils = require("../utils");

const messages = {};

async function handleEmbedMessage(channel, data, type, userRole) {
    messages[type] = await createEmbedMessage(channel, data, type).then( embed => {
        return sendEmbedMessage(channel, embed, type, data, userRole).catch(console.error);
    }).catch(console.error);
}

async function createEmbedMessage(channel, data, type) {
    let embed;
    if (type === 'subscription' || type === 'checkIn') {
        embed = new Discord.MessageEmbed()
            .setTitle(data.embed[type].title)
            .setColor(data.embed[type].color)
            .setDescription(data.embed[type].description);
        createFieldTable(embed, data.dailies, 'Emotes');
        return embed;
    }

    embed = new Discord.MessageEmbed()
        .setTitle(data.embed[type].title)
        .setColor(data.embed[type].color)
        .setDescription(data.embed[type].description);

    createPermissionEmotes(data.embed[type].fields, channel);
    createFieldTable(embed, data.embed[type].fields, 'Permissions');

    return embed;
}

function createFieldTable(embed, data, title) {
    let text = '';
    data.forEach( (datum, index) => {
        text += `${ datum.emote } ${ datum.text }`;
        if (index !== data.length - 1) {
            text += '\n';
        }
    })
    embed.addField(title, text, true);
}

function createPermissionEmotes(data, channel) {
    data.forEach( datum => {
        datum.emote = ':x:';
        if (channel.guild.me.hasPermission(datum.flag)) {
            datum.emote = ':o:';
        }
    })
}

async function sendEmbedMessage(channel, embed, type, data, userRole) {
    return channel.send(embed).then( message => {
        if (type === 'subscription' || type === 'checkIn') {
            reactEmotes(message, data.dailies, data.reactionNumbers).then( usedEmotes => {
                const filter = (reaction, user) => {
                    return usedEmotes.includes(reaction.emoji.name) && (user.id !== message.author.id);
                };
                awaitReaction(message, filter, userRole).catch(console.error);
            }).catch(console.error);
        }

        return message;
    }).catch(console.error);
}

async function reactEmotes(message, dailies, reactionNumbers) {
    let usedEmotes = [];
    dailies.forEach(daily => {
        // noinspection JSUnresolvedVariable
        message.react(`${ reactionNumbers[daily.emoteUnicodeIndex] }`);
        // noinspection JSUnresolvedVariable
        usedEmotes.push(`${ reactionNumbers[daily.emoteUnicodeIndex] }`);
    });

    return usedEmotes;
}

async function awaitReaction(message, filter, userRole) {
    message.awaitReactions(filter, { max: 1 })
        .then(collected => {
            const reaction = collected.last();
            const userId = reaction.users.cache.last().id;
            handleReactions(message, userId, userRole, filter)
        })
        .catch(console.error);
}

const handleReactionRemovals = async (messageReaction, userId, botChannel, userRole) => {
    //only let bot listen to its own channel, own messages
    if (!(botChannel && messageReaction.message.channel.id === botChannel.id
        && (messageReaction.message.id === messages.subscription.id || messageReaction.message.id === messages.checkIn.id))) {
        return;
    }

    if (messageReaction.message.id === messages.subscription.id) {
        const reactions = messageReaction.message.reactions.cache;
        //negating the result to read it easier
        const userSubscribed = !reactions.every( reaction => {
            //searching if user is not subscribed at all so it stops if there is atleast one sub, that's why its negated
            return !reaction.users.cache.some( reactionUser => reactionUser.id === userId);
        })
        if (userSubscribed) {
            handleReactions(messageReaction.message, userId, userRole).catch(console.error);

            return;
        }

        const user = utils.findItemById(messageReaction.message.guild.members.cache, userId);
        user.roles.remove(userRole).catch(console.error);

        return;
    }

    handleReactions(messageReaction.message, userId, userRole).catch(console.error);
};

async function handleReactions(message, userId, userRole, filter) {
    if (userId === message.author.id) {
        if (filter) {
            awaitReaction(message, filter, userRole).catch(console.error);
        }

        return;
    }

    const subscriptionReactions = messages.subscription.reactions.cache;
    const checkInReactions = messages.checkIn.reactions.cache;
    const user = utils.findItemById(message.guild.members.cache, userId);
    const checkedIn = implication(userId, subscriptionReactions, checkInReactions);
    if (!checkedIn) {
        user.roles.add(utils.findItemById(message.guild.roles.cache, userRole.id)).catch(console.error);
        if (filter) {
            awaitReaction(message, filter, userRole).catch(console.error);
        }

        return;
    }

    user.roles.remove(userRole).catch(console.error);
    if (filter) {
        awaitReaction(message, filter, userRole).catch(console.error);
    }
}

//implication A->B
function implication(userId, reactionsA, reactionsB) {
    return reactionsA.every( reactionA => {
        return reactionsB.every( reactionB => {
            const userReacted = {};

            if (reactionA.emoji.name === reactionB.emoji.name)  {
                userReacted.A = reactionA.users.cache.some( user => user.id === userId);
                userReacted.B = reactionB.users.cache.some( user => user.id === userId);
            }

            return !userReacted.A || userReacted.B;
        });

    });
}

const mention = async (channel, role) => {
    await role.setMentionable(true).catch(console.error);
    await channel.send(`<@&${ role.id }> reminding`).catch(console.error);
    await role.setMentionable(false).catch(console.error);
}

exports.handleEmbedMessage = handleEmbedMessage;
exports.handleReactionRemovals = handleReactionRemovals;
exports.mention = mention;

