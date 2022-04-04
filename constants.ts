import { MessageEmbed } from "discord.js";
import { BotConstants } from "./custom-types";

function GetBaseEmbed() : MessageEmbed {
	return new MessageEmbed()
		.setColor('#0099ff')
		.setFooter({ text: 'Bot made by @blaku' });
}

export default {
    commandPrefix: '*',
    commandChannelID: '846578254856060958',
    verifiedChannelID: '959526619138097183',
    baseEmbedFunc: GetBaseEmbed
} as BotConstants