const cron = require('node-cron');

const installerController = require("../Controllers/installer");
const messageController = require("../Controllers/message");

const install = async message => {
    const server = await installerController.initServer(message.guild, message.client).catch(console.log);

    messageController.init(server.channels.bot, server.roles.user);
    await messageController.install(message.channel).catch(console.log);
    await messageController.subscription().catch(console.log);
    await messageController.checkIn().catch(console.log); //daily job

    //'0 0 4,22 * * *'
    //'0 0 0 * * 1'
    const job = cron.schedule('0 * * * * *', () => {
            messageController.reminder().catch(console.log);
        },
        {
            timezone: 'Europe/Budapest'
        });
    job.start();
};

exports.install = install;