"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_manager_1 = __importDefault(require("../queue-manager"));
function QueueCommand(content) {
    if (queue_manager_1.default.queuePick) {
        content.shouldMessage = false;
        return content;
    }
    if (queue_manager_1.default.playerIDQueue.includes(content.userId)) {
        content.responseEmbed.setTitle('You\'re already in the queue').addFields(queue_manager_1.default.queueStatus());
        return content;
    }
    queue_manager_1.default.playerIDQueue.push(content.userId);
    if (queue_manager_1.default.playerIDQueue.length === 1) {
        let queueTime = 10;
        const startTimeArg = content.args.shift() || '10';
        if (!isNaN(+startTimeArg)) {
            const time = parseInt(startTimeArg);
            if (time < 1 || time > 60) {
                content.responseEmbed.addFields({ name: 'New queue started', value: `<@${content.userId}> has started a new queue! Type !q to join.` }, { name: 'Queue time not in range', value: `Time can only be between 1 and 60 minutes.\nYou have ${queueTime} minutes to join the queue` });
            }
            else {
                queueTime = Number(startTimeArg);
                content.responseEmbed.addField('New queue started', `<@${content.userId}> has started a new queue! Type !q to join. You have ${queueTime} minutes to join`);
            }
        }
        else {
            content.responseEmbed.addField('New queue started', `<@${content.userId}> has started a new queue! Type !q to join. You have ${queueTime} minutes to join`);
        }
        queue_manager_1.default.startQueue(queueTime);
    }
    else {
        content.responseEmbed.addFields({ name: 'Racer joined the queue.', value: `<@${content.userId}> joined the queue` }).addFields(queue_manager_1.default.queueStatus());
    }
    return content;
}
exports.default = {
    shortKey: 'q',
    longKey: 'queue',
    commandFunc: QueueCommand
};
