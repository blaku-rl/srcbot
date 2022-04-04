import { CommandStruct, CustomCommand } from './custom-types';
import commands from "./commands"

const commandList : Record<string, (arg0: CommandStruct) => CommandStruct> = {};

for (const item in commands) {
    const command : CustomCommand = commands[item]
    commandList[command.shortKey] = command.commandFunc
    if (command.longKey !== undefined) {
        commandList[command.longKey] = command.commandFunc
    }
}

export default commandList