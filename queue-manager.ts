import { CommandStruct, FieldInfo, Queue, TimeOutInfo } from "./custom-types";
import categoriesInfo from './categories-importer'
import constants from './constants'
import client from './index'
import commandList from './command-manager'

const queue : Queue = {
    playerIDQueue: [],
    queuePick: false,
    queueStatus: GetQueueStatusAry,
    startQueue: StartQueueTimer,
    stopQueue: StopQueue,
    popQueue: PopQueue
}

let queueTimeout : TimeOutInfo;
let selectionTimeout : NodeJS.Timeout;

function GetQueueStatusAry() : FieldInfo[] {
	return [
		{ name: `Current queue members: ${queue.playerIDQueue.length}`, value: GetQueueString() },
		{ name: 'Time Remaining', value: `You have ${GetTimeLeft()} minutes left to join` },
	];
}

function GetQueueString() : string {
	let queueString = '';
	for (const id of queue.playerIDQueue) {
		queueString += `<@${id}> `;
	}
	return queueString;
}

function GetTimeLeft() : number {
	return Math.ceil(Math.ceil((queueTimeout.delay - (new Date().getTime() - queueTimeout.startedTime)) / 1000) / 60);
}

function StartQueueTimer(min : number) {
    queueTimeout = {
        timeout: setTimeout(QueuePopTime, min * 60000),
        startedTime: new Date().getTime(),
        delay: min * 60000
    }
}

function StopQueue() {
    clearTimeout(queueTimeout.timeout);
}

function PopQueue() {
    StopQueue()
    QueuePopTime()
}

function QueuePopTime() {
    const channel = client.channels.cache.get(constants.commandChannelID)
    if (channel === null || channel?.type !== 'GUILD_TEXT') return
    if (queue.playerIDQueue.length === 0) {
        channel.send({ content: 'No queue members :(' })
        return
    }
    queue.queuePick = true
    channel.send({ content: `Queue is ready! ${GetQueueString()} come on down to race! Pick a category below to race in. If no category is selected after 2 minutes, the queue will end.` })
        .then(() => {
            for (const cat in categoriesInfo.categoriesJson) {
                const curCommand = categoriesInfo.categoriesJson[cat].command
                if (!(curCommand in commandList)) {
                    commandList[curCommand] = HandleMapSelection
                }
            }
            if (!('rand' in commandList)) {
                commandList['rand'] = HandleMapSelection
            }
            const responseEmbed = constants.baseEmbedFunc().addField('Racing Categories', categoriesInfo.categoriesString)
            channel.send({ embeds: [responseEmbed] })
            selectionTimeout = setTimeout(NoMapSelected, 120000)
        })
        .catch(console.error)
}

function NoMapSelected() {
    const channel = client.channels.cache.get(constants.commandChannelID)
	if(channel === null || channel?.type !== 'GUILD_TEXT') return
    queue.queuePick = false;
    queue.playerIDQueue = [];
    const responseEmbed = constants.baseEmbedFunc().addField('No category selected', 'The queue has been deleted. You can start a new one with !q');
    channel.send({ embeds: [responseEmbed] });
}

function HandleMapSelection(content : CommandStruct) : CommandStruct {
    if (!queue.queuePick) {
        content.shouldMessage = false
        return content
    }
    if (content.command === 'rand') {
        return SelectMap((Math.floor(Math.random() * categoriesInfo.categoriesJson.length)), content)
    }
    for (const cat in categoriesInfo.categoriesJson) {
        const curCommand = categoriesInfo.categoriesJson[cat].command
        if (curCommand === content.command) {
            const index = parseInt(cat)
            return SelectMap(index, content)
        }
    }
    content.shouldMessage = false
    return content
}

function SelectMap(index : number, content : CommandStruct) : CommandStruct {
	if (!queue.playerIDQueue.includes(content.userId)) {
		content.responseEmbed.addField('You\'re not in the queue', 'Gotta be in the queue to select a category.')
		return content
	}
	clearTimeout(selectionTimeout);
	const cat = categoriesInfo.categoriesJson[index];
	const mapName = cat.maps[Math.floor(Math.random() * cat.maps.length)].name;
	content.responseEmbed.addField('Selected Map', mapName);
	queue.queuePick = false;
	queue.playerIDQueue = [];
    return content
}

export default queue