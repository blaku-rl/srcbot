"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = __importDefault(require("./commands"));
const commandList = {};
for (const item in commands_1.default) {
    const command = commands_1.default[item];
    commandList[command.shortKey] = command.commandFunc;
    if (command.longKey !== undefined) {
        commandList[command.longKey] = command.commandFunc;
    }
}
exports.default = commandList;
