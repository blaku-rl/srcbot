"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const command_manager_1 = __importDefault(require("./command-manager"));
const constants_1 = __importDefault(require("./constants"));
const RequestManager_1 = __importDefault(require("./speedrun/RequestManager"));
const StatusCommands_1 = require("./speedrun/StatusCommands");
dotenv_1.default.config();
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES
    ]
});
client.on('ready', () => {
    console.log('Ready!');
});
const status = new StatusCommands_1.StatusCommands(client);
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (message.author !== client.user && message.content.startsWith('-') && message.channelId === process.env.BOTCOMMANDS) {
        status.HandleCommand(message.content.slice(1));
        return;
    }
    if (message.author === client.user || !message.content.startsWith(constants_1.default.commandPrefix) || message.channelId !== process.env.COMMANDCHANNEL)
        return;
    const args = message.content.slice(constants_1.default.commandPrefix.length).split(/ +/);
    const initCommand = args.shift() || '';
    const command = initCommand.toLowerCase();
    let content = {
        command: command,
        args: args,
        userId: message.author.id,
        responseEmbed: constants_1.default.baseEmbedFunc(),
        message: message,
        shouldMessage: true
    };
    try {
        if (command in command_manager_1.default) {
            content = command_manager_1.default[command](content);
            if (content.shouldMessage) {
                yield content.message.channel.send({ embeds: [content.responseEmbed] });
            }
            return;
        }
        else {
            content.responseEmbed.addField('Command not found', 'Use *h to get a list of valid commands');
            yield message.channel.send({ embeds: [content.responseEmbed] });
        }
    }
    catch (error) {
        content.responseEmbed.addField('An Error Occured', 'Mesasge blaku with the issue');
        yield message.channel.send({ embeds: [content.responseEmbed] });
        console.error(error);
    }
}));
client.login(process.env.TOKEN);
RequestManager_1.default.BeginLooping();
exports.default = client;
