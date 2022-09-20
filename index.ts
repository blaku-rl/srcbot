import { Client, Intents, Message, MessageEmbed } from 'discord.js'
import dotenv from 'dotenv'
import { CommandStruct } from './custom-types'
import commandList from './command-manager'
import constants from './constants'
import requestManager from './speedrun/RequestManager'
import { StatusCommands } from './speedrun/StatusCommands'
dotenv.config()

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})

client.on('ready', () => {
    console.log('Ready!')
})

const status = new StatusCommands(client);

client.on('messageCreate', async (message : Message) => {
    if (message.author !== client.user && message.content.startsWith('-') && message.channelId === process.env.BOTCOMMANDS) {
        status.HandleCommand(message.content.slice(1));
        return;
    }
	if (message.author === client.user || !message.content.startsWith(constants.commandPrefix) || message.channelId !== process.env.COMMANDCHANNEL) return;

	const args = message.content.slice(constants.commandPrefix.length).split(/ +/);
    const initCommand = args.shift() || '';
	const command = initCommand.toLowerCase();

    let content : CommandStruct = {
        command: command,
        args : args,
        userId : message.author.id,
        responseEmbed : constants.baseEmbedFunc(),
        message : message,
        shouldMessage : true
    }

	try {
		if (command in commandList) {
            content = commandList[command](content)
            if (content.shouldMessage){
                await content.message.channel.send({ embeds: [content.responseEmbed] });
            }
            return
        } else {
			content.responseEmbed.addField('Command not found', 'Use *h to get a list of valid commands');
			await message.channel.send({ embeds: [content.responseEmbed] });
		}
	} catch (error) {
        content.responseEmbed.addField('An Error Occured', 'Mesasge blaku with the issue');
        await message.channel.send({ embeds: [content.responseEmbed] });
		console.error(error);
	}
});

client.login(process.env.TOKEN);
requestManager.BeginLooping();

export default client;