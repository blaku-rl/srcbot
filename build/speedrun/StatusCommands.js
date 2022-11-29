"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCommands = void 0;
const SRCTypes_1 = __importDefault(require("./SRCTypes"));
class StatusCommands {
    constructor(client) {
        this.client = client;
        this.commands = {
            'maplist': this.MapList.bind(this),
            'mapdetails': this.MapDetails.bind(this)
        };
    }
    HandleCommand(commandMsg) {
        const args = commandMsg.split(/ +/);
        const initCommand = args.shift() || '';
        const command = initCommand.toLowerCase();
        if (command in this.commands) {
            this.commands[command](args);
        }
        else {
            this.PostResponse('Not a valid command');
        }
    }
    MapList(content) {
        let response = '';
        for (const map in SRCTypes_1.default.allMaps) {
            const newInfo = `Name: ${SRCTypes_1.default.allMaps[map].name}, ID: ${SRCTypes_1.default.allMaps[map].id}\n`;
            response = this.EnsureUnderMaxDiscordLimit(response, newInfo);
        }
        this.PostResponse(response);
    }
    MapDetails(content) {
        if (content.length !== 1) {
            this.PostResponse('Must only include the map id to search');
            return;
        }
        const id = content[0];
        if (!(id in SRCTypes_1.default.allMaps)) {
            this.PostResponse('Id not found in maps');
            return;
        }
        const curMap = SRCTypes_1.default.allMaps[id];
        let response = '';
        response = this.EnsureUnderMaxDiscordLimit(response, `Name: ${curMap.name}\n`);
        response = this.EnsureUnderMaxDiscordLimit(response, `ID: ${curMap.id}\n`);
        response = this.EnsureUnderMaxDiscordLimit(response, `Image: <${curMap.image}>\n`);
        response = this.EnsureUnderMaxDiscordLimit(response, `Last Verified Date: ${curMap.latestVerifiedDate}\n`);
        response = this.EnsureUnderMaxDiscordLimit(response, `Levels: [`);
        for (const level in curMap.levels) {
            const curLevel = curMap.levels[level];
            response = this.EnsureUnderMaxDiscordLimit(response, `\n      Name: ${curLevel.name}, ID: ${curLevel.id}`);
        }
        response = this.EnsureUnderMaxDiscordLimit(response, `\n]\n`);
        response = this.EnsureUnderMaxDiscordLimit(response, `Categories: [`);
        for (const cat in curMap.categories) {
            const curCat = curMap.categories[cat];
            response = this.EnsureUnderMaxDiscordLimit(response, `\n      Name: ${curCat.name}, ID: ${curCat.id}`);
        }
        response = this.EnsureUnderMaxDiscordLimit(response, `\n]\n`);
        response = this.EnsureUnderMaxDiscordLimit(response, `Variables: [`);
        for (const variable in curMap.variables) {
            const curVar = curMap.variables[variable];
            response = this.EnsureUnderMaxDiscordLimit(response, `\n      ID: ${curVar.id}\n`);
            response = this.EnsureUnderMaxDiscordLimit(response, `      Is Subcategory: ${curVar.isSubCategory}\n`);
            response = this.EnsureUnderMaxDiscordLimit(response, `      Values: [`);
            for (const value in curVar.values) {
                response = this.EnsureUnderMaxDiscordLimit(response, `\n              "${value}": "${curVar.values[value]}"`);
            }
            response = this.EnsureUnderMaxDiscordLimit(response, `\n      ]\n`);
        }
        response = this.EnsureUnderMaxDiscordLimit(response, `]\n`);
        response = this.EnsureUnderMaxDiscordLimit(response, `Submitted Runs Waiting For Deletion: [`);
        for (const oldRun in curMap.oldSubmittedRuns) {
            const run = curMap.oldSubmittedRuns[oldRun];
            response = this.EnsureUnderMaxDiscordLimit(response, `\n      Message ID: ${run.messageID}\n`);
            response = this.EnsureUnderMaxDiscordLimit(response, `      Run Link: <${run.run.link}>\n`);
            response = this.EnsureUnderMaxDiscordLimit(response, `      Runners: ${run.run.GetRunnersString()}`);
        }
        response = this.EnsureUnderMaxDiscordLimit(response, `\n]\n`);
        this.PostResponse(response);
    }
    EnsureUnderMaxDiscordLimit(curResponse, newAddition) {
        if (curResponse.length + newAddition.length >= 2000) {
            this.PostResponse(curResponse);
            return newAddition;
        }
        return curResponse + newAddition;
    }
    PostResponse(message) {
        if (process.env.BOTCOMMANDS === undefined)
            return;
        this.client.channels.fetch(process.env.BOTCOMMANDS)
            .then(channel => {
            if (channel === null || (channel === null || channel === void 0 ? void 0 : channel.type) !== 'GUILD_TEXT')
                return;
            try {
                channel.send({ content: message });
            }
            catch (error) {
                console.error(error);
            }
        })
            .catch(console.error);
    }
}
exports.StatusCommands = StatusCommands;
