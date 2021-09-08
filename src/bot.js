// Run dotenv
require('dotenv').config({path: __dirname + '/../.env'});


const Discord = require('discord.js');
const client = new Discord.Client();

const commandController = require("./Controllers/command");
const messageController = require("./Controllers/message");

client.on('ready',  () => {
    console.log(`Logged in as ${ client.user.tag }!`);
});

client.on('message', message => {
    commandController.execute(message).catch(console.log);
});

client.on('messageReactionRemove', (messageReaction, user) => {
    messageController.reactionRemoval(messageReaction, user).catch(console.log);
});

client.login(process.env.DISCORD_TOKEN).catch(console.log);