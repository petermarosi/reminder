const commandService = require("../Services/command");

const execute = async message => {
    switch (message.content) {
        case '?reminder test':
            message.channel.send('testing');
            break;
        case '?reminder install':
            message.channel.send('installing');
            await commandService.install(message).catch(console.log);
            message.channel.send('installed');
            break;
    }
}

exports.execute = execute;