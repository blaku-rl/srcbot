"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
function GetBaseEmbed() {
    return new discord_js_1.MessageEmbed()
        .setColor('#0099ff')
        .setFooter({ text: 'Bot made by @blaku' });
}
exports.default = {
    commandPrefix: '*',
    baseEmbedFunc: GetBaseEmbed
};
