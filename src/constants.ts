import { MessageEmbed } from "discord.js";
import { BotConstants } from "./custom-types";

function GetBaseEmbed() : MessageEmbed {
	return new MessageEmbed()
		.setColor('#0099ff')
		.setFooter({ text: 'Bot made by @blaku' });
}

export default {
    commandPrefix: '*',
    baseEmbedFunc: GetBaseEmbed
} as BotConstants