"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function HelpCommand(content) {
    content.responseEmbed.setTitle('List of available commands')
        .addFields({ name: '*q or *queue', value: 'Start or join a queue. Add a number between 1 and 60 for how many minutes the q should be active for' }, { name: '*l or *leave', value: 'Leave a queue' }, { name: '*s or *status', value: 'View the current people in the queue as well as the time remaining' }, { name: '*b or *begin', value: 'Will start immediately pop the queue and begin category selection' }, { name: '*cat or *categories', value: 'Displays a list of categories to race with' }, { name: '*r or *recent', value: 'Get the last 10 verified runs for rocket league' }, { name: '*h or *help', value: 'Display this help box' }, { name: '*blaku', value: 'Tell you about the squid' });
    return content;
}
exports.default = {
    shortKey: 'h',
    longKey: 'help',
    commandFunc: HelpCommand
};
