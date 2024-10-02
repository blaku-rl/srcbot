"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const RequestManager_1 = __importDefault(require("./speedrun/RequestManager"));
dotenv_1.default.config();
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages],
    partials: [discord_js_1.Partials.Channel],
});
client.on("ready", () => {
    console.log("Ready!");
});
client.login(process.env.TOKEN);
RequestManager_1.default.BeginLooping();
exports.default = client;
