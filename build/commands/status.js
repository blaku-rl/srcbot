"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_manager_1 = __importDefault(require("../queue-manager"));
function StatusCommand(content) {
    if (queue_manager_1.default.playerIDQueue.length === 0) {
        content.responseEmbed.setTitle('Queue Status').addField('Queue is empty', 'Be the first to join a queue with !q');
    }
    else if (queue_manager_1.default.queuePick) {
        const status = queue_manager_1.default.queueStatus();
        content.responseEmbed.setTitle('Queue Status').addField(status[0].name, status[0].value);
    }
    else {
        content.responseEmbed.setTitle('Queue Status').addFields(queue_manager_1.default.queueStatus());
    }
    return content;
}
exports.default = {
    shortKey: 's',
    longKey: 'status',
    commandFunc: StatusCommand
};
