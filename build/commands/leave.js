"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_manager_1 = __importDefault(require("../queue-manager"));
function LeaveCommand(content) {
    if (!queue_manager_1.default.playerIDQueue.includes(content.userId)) {
        if (queue_manager_1.default.playerIDQueue.length === 0) {
            content.responseEmbed.addField('Queue has not been started', 'Use !q to start a new queue');
        }
        else {
            content.responseEmbed.setTitle('You\'re not in the queue').addFields(queue_manager_1.default.queueStatus());
        }
        return content;
    }
    const index = queue_manager_1.default.playerIDQueue.indexOf(content.userId);
    if (index > -1) {
        queue_manager_1.default.playerIDQueue.splice(index, 1);
    }
    if (queue_manager_1.default.playerIDQueue.length === 0) {
        content.responseEmbed.addFields({ name: 'Racer left the queue.', value: `<@${content.userId}> left the queue` }, { name: 'Queue Empty', value: 'There is nobody in the queue' });
        queue_manager_1.default.stopQueue();
    }
    else {
        content.responseEmbed.addField('Racer left the queue.', `<@${content.userId}> left the queue`).addFields(queue_manager_1.default.queueStatus());
    }
    return content;
}
exports.default = {
    shortKey: 'l',
    longKey: 'leave',
    commandFunc: LeaveCommand
};
