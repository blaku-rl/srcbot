// require('.env').config();
const { Client, Intents, MessageEmbed } = require('discord.js');
const { categories } = require('./categories.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const prefix = '!';
const channelName = 'bots-only';

let queue = [];
let queueTimeout;
let selectionTimeout;
let queuePick = false;
const categoriesFields = [];
let categoriesString = '';
for (const cat of categories) {
	categoriesFields.push({
		name: cat.name,
		value: cat.description,
	});

	categoriesString += `!${cat.command} ${cat.name}\n`;
}
categoriesString += '!rand Random Category';

function GetBaseEmbed() {
	return new MessageEmbed()
		.setColor('#0099ff')
		.setFooter({ text: 'Bot made by @blaku' });
}

function GetQueueStatusAry() {
	return [
		{ name: `Current queue members: ${queue.length}`, value: GetQueueString() },
		{ name: 'Time Remaining', value: `You have ${GetTimeLeft()} minutes left to join` },
	];
}

function GetQueueString() {
	let queueString = '';
	for (const id of queue) {
		queueString += `<@${id}> `;
	}
	return queueString;
}

async function QueueCommand(args, userId, responseEmbed, message) {
	if (queuePick) return;

	if (queue.includes(userId)) {
		responseEmbed.setTitle('You\'re already in the queue').addFields(GetQueueStatusAry());
		await message.channel.send({ embeds: [responseEmbed] });
		return;
	}

	queue.push(userId);

	if (queue.length === 1) {
		let queueTime = 10;
		const startTimeArg = args.shift();
		if (!isNaN(startTimeArg)) {
			const time = parseInt(startTimeArg);
			if (time < 1 || time > 60) {
				responseEmbed.addFields(
						{ name: 'New queue started', value: `<@${userId}> has started a new queue! Type !q to join.` },
						{ name: 'Queue time not in range', value: `Time can only be between 1 and 60 minutes.\nYou have ${queueTime} minutes to join the queue` });
			} else {
				queueTime = startTimeArg;
				responseEmbed.addField('New queue started', `<@${userId}> has started a new queue! Type !q to join. You have ${queueTime} minutes to join`);
			}
		} else {
			responseEmbed.addField('New queue started', `<@${userId}> has started a new queue! Type !q to join. You have ${queueTime} minutes to join`);
		}
		queueTimeout = setTimeout(QueuePopTime, queueTime * 60000);
	} else {
		responseEmbed.addFields({ name: 'Racer joined the queue.', value: `<@${userId}> joined the queue` }).addFields(GetQueueStatusAry());
	}

	await message.channel.send({ embeds: [responseEmbed] });
}

async function BeginCommand(args, userId, responseEmbed, message) {
	if (queue.length === 0 || !queue.includes(userId)) {
		responseEmbed.addFields({ name: 'You\'re not in the queue.', value: 'Join the queue to start it' });
		await message.channel.send({ embeds: [responseEmbed] });
		return;
	}
	if (!queuePick) {
		clearTimeout(queueTimeout);
		QueuePopTime();
	}
}

async function LeaveCommand(args, userId, responseEmbed, message) {
	if (!queue.includes(userId)) {
		if (queue.length === 0) {
			responseEmbed.addField('Queue has not been started', 'Use !q to start a new queue');
		}
		else {
			responseEmbed.setTitle('You\'re not in the queue').addFields(GetQueueStatusAry());
		}
		await message.channel.send({ embeds: [responseEmbed] });
		return;
	}

	const index = queue.indexOf(userId);
	if (index > -1) {
		queue.splice(index, 1);
	}

	if (queue.length === 0) {
		responseEmbed.addFields(
				{ name: 'Racer left the queue.', value: `<@${userId}> left the queue` },
				{ name: 'Queue Empty', value: 'There is nobody in the queue' });
			clearTimeout(queueTimeout);
	} else {
		responseEmbed.addField('Racer left the queue.', `<@${userId}> left the queue`).addFields(GetQueueStatusAry());
	}

	await message.channel.send({ embeds: [responseEmbed] });
}

async function StatusCommand(args, userId, responseEmbed, message) {
	if (queue.length === 0) {
		responseEmbed.setTitle('Queue Status').addField('Queue is empty', 'Be the first to join a queue with !q');
	} else if (queuePick) {
		responseEmbed.setTitle('Queue Status').addField(GetQueueStatusAry()[0]);
	} else {
		responseEmbed.setTitle('Queue Status').addFields(GetQueueStatusAry());
	}
	await message.channel.send({ embeds: [responseEmbed] });
}

async function CategoriesCommand(args, userId, responseEmbed, message) {
	responseEmbed.setTitle('Racing Categories').addFields(categoriesFields);
	await message.channel.send({ embeds: [responseEmbed] });
}

async function BlakuCommand(args, userId, responseEmbed, message) {
	responseEmbed.setTitle('My master who I aim to please.');
	await message.channel.send({ embeds: [responseEmbed] });
}

async function HelpCommand(args, userId, responseEmbed, message) {
	responseEmbed.setTitle('List of available commands')
		.addFields(
			{ name: '!q or !queue', value: 'Start or join a queue. Add a number between 1 and 60 after to decide how long the queue will last' },
			{ name: '!l or !leave', value: 'Leave a queue' },
			{ name: '!s or !status', value: 'View the current people in the queue as well as the time remaining' },
			{ name: '!b or !begin', value: 'Will start immediately pop the queue and begin category selection' },
			{ name: '!cat or !categories', value: 'Displays a list of categories to race with' },
			{ name: '!h or !help', value: 'Display this help box' },
			{ name: '!blaku', value: 'Tell you about the squid' });
	await message.channel.send({ embeds: [responseEmbed] });
}

const commandList = {
	'q': QueueCommand,
	'queue': QueueCommand,
	'b': BeginCommand,
	'begin': BeginCommand,
	'l': LeaveCommand,
	'leave': LeaveCommand,
	's': StatusCommand,
	'status': StatusCommand,
	'cat': CategoriesCommand,
	'categories': CategoriesCommand,
	'blaku': BlakuCommand,
	'h': HelpCommand,
	'help': HelpCommand,
};

async function SelectMap(index, userId, responseEmbed, message) {
	if (!queue.includes(userId)) {
		responseEmbed.addField('You\'re not in the queue', 'Gotta be in the queue to select a category.');
		return;
	}
	clearTimeout(selectionTimeout);
	const cat = categories[index];
	const mapName = cat.maps[Math.floor(Math.random() * cat.maps.length)];
	responseEmbed.addField('Selected Map', mapName);
	await message.channel.send({ embeds: [responseEmbed] });
	queuePick = false;
	queue = [];
}

function QueuePopTime() {
	client.channels.fetch('957884429060145172')
		.then(channel => {
			if (queue.length === 0) {
				channel.send({ content: 'No queue members :(' });
				return;
			}
			queuePick = true;
			channel.send({ content: `Queue is ready! ${GetQueueString()} come on down to race! Pick a category below to race in. If no category is selected after 2 minutes, the queue will end.` })
				.then(() => {
					const responseEmbed = GetBaseEmbed().addField('Racing Categories', categoriesString);
					channel.send({ embeds: [responseEmbed] });
					selectionTimeout = setTimeout(NoMapSelected, 120000);
				})
				.catch(console.error);
		})
		.catch(console.error);
}

function NoMapSelected() {
	client.channels.fetch('957884429060145172')
		.then(channel => {
			queuePick = false;
			queue = [];
			const responseEmbed = GetBaseEmbed().addField('No category selected', 'The queue has been deleted. You can start a new one with !q');
			channel.send({ embeds: [responseEmbed] });
		})
		.catch(console.error);
}

function GetTimeLeft() {
	return Math.ceil(Math.ceil((queueTimeout._idleStart + queueTimeout._idleTimeout) / 1000 - process.uptime()) / 60);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('messageCreate', async message => {
	if (message.author === client.user || !message.content.startsWith(prefix) || message.channel.name !== channelName) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
	const userId = message.author.id;
	const responseEmbed = GetBaseEmbed();

	try {
		if (queuePick) {
			for (let i = 0; i < categories.length; i++) {
				if (command === categories[i].command) {
					await SelectMap(i, userId, responseEmbed, message);
					return;
				}
			}
			if (command === 'rand') {
				await SelectMap(Math.floor(Math.random() * categories.length), userId, responseEmbed, message);
				return;
			}
		}

		if (command in commandList) {
			await commandList[command](args, userId, responseEmbed, message);
		} else {
			responseEmbed.addField('Command not found', 'Use !h to get a list of valid commands');
			await message.channel.send({ embeds: [responseEmbed] });
		}
	} catch (error) {
		console.error(error);
	}
});

client.login(process.env.TOKEN);