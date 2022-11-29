"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_manager_1 = __importDefault(require("../queue-manager"));
function BeginCommand(content) {
    if (queue_manager_1.default.playerIDQueue.length === 0 || !queue_manager_1.default.playerIDQueue.includes(content.userId)) {
        content.responseEmbed.addFields({ name: 'You\'re not in the queue.', value: 'Join the queue to start it' });
        return content;
    }
    if (!queue_manager_1.default.queuePick) {
        queue_manager_1.default.popQueue();
    }
    content.shouldMessage = false;
    return content;
}
exports.default = {
    shortKey: 'b',
    longKey: 'begin',
    commandFunc: BeginCommand
};
