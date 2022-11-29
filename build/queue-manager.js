"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const categories_importer_1 = __importDefault(require("./categories-importer"));
const constants_1 = __importDefault(require("./constants"));
const index_1 = __importDefault(require("./index"));
const command_manager_1 = __importDefault(require("./command-manager"));
const queue = {
    playerIDQueue: [],
    queuePick: false,
    queueStatus: GetQueueStatusAry,
    startQueue: StartQueueTimer,
    stopQueue: StopQueue,
    popQueue: PopQueue
};
let queueTimeout;
let selectionTimeout;
function GetQueueStatusAry() {
    return [
        { name: `Current queue members: ${queue.playerIDQueue.length}`, value: GetQueueString() },
        { name: 'Time Remaining', value: `You have ${GetTimeLeft()} minutes left to join` },
    ];
}
function GetQueueString() {
    let queueString = '';
    for (const id of queue.playerIDQueue) {
        queueString += `<@${id}> `;
    }
    return queueString;
}
function GetTimeLeft() {
    return Math.ceil(Math.ceil((queueTimeout.delay - (new Date().getTime() - queueTimeout.startedTime)) / 1000) / 60);
}
function StartQueueTimer(min) {
    queueTimeout = {
        timeout: setTimeout(QueuePopTime, min * 60000),
        startedTime: new Date().getTime(),
        delay: min * 60000
    };
}
function StopQueue() {
    clearTimeout(queueTimeout.timeout);
}
function PopQueue() {
    StopQueue();
    QueuePopTime();
}
function QueuePopTime() {
    const channel = index_1.default.channels.cache.get(constants_1.default.commandChannelID);
    if (channel === null || (channel === null || channel === void 0 ? void 0 : channel.type) !== 'GUILD_TEXT')
        return;
    if (queue.playerIDQueue.length === 0) {
        channel.send({ content: 'No queue members :(' });
        return;
    }
    queue.queuePick = true;
    channel.send({ content: `Queue is ready! ${GetQueueString()} come on down to race! Pick a category below to race in. If no category is selected after 2 minutes, the queue will end.` })
        .then(() => {
        for (const cat in categories_importer_1.default.categoriesJson) {
            const curCommand = categories_importer_1.default.categoriesJson[cat].command;
            if (!(curCommand in command_manager_1.default)) {
                command_manager_1.default[curCommand] = HandleMapSelection;
            }
        }
        if (!('rand' in command_manager_1.default)) {
            command_manager_1.default['rand'] = HandleMapSelection;
        }
        const responseEmbed = constants_1.default.baseEmbedFunc().addField('Racing Categories', categories_importer_1.default.categoriesString);
        channel.send({ embeds: [responseEmbed] });
        selectionTimeout = setTimeout(NoMapSelected, 120000);
    })
        .catch(console.error);
}
function NoMapSelected() {
    const channel = index_1.default.channels.cache.get(constants_1.default.commandChannelID);
    if (channel === null || (channel === null || channel === void 0 ? void 0 : channel.type) !== 'GUILD_TEXT')
        return;
    queue.queuePick = false;
    queue.playerIDQueue = [];
    const responseEmbed = constants_1.default.baseEmbedFunc().addField('No category selected', 'The queue has been deleted. You can start a new one with !q');
    channel.send({ embeds: [responseEmbed] });
}
function HandleMapSelection(content) {
    if (!queue.queuePick) {
        content.shouldMessage = false;
        return content;
    }
    if (content.command === 'rand') {
        return SelectMap((Math.floor(Math.random() * categories_importer_1.default.categoriesJson.length)), content);
    }
    for (const cat in categories_importer_1.default.categoriesJson) {
        const curCommand = categories_importer_1.default.categoriesJson[cat].command;
        if (curCommand === content.command) {
            const index = parseInt(cat);
            return SelectMap(index, content);
        }
    }
    content.shouldMessage = false;
    return content;
}
function SelectMap(index, content) {
    if (!queue.playerIDQueue.includes(content.userId)) {
        content.responseEmbed.addField('You\'re not in the queue', 'Gotta be in the queue to select a category.');
        return content;
    }
    clearTimeout(selectionTimeout);
    const cat = categories_importer_1.default.categoriesJson[index];
    const mapName = cat.maps[Math.floor(Math.random() * cat.maps.length)].name;
    content.responseEmbed.addField('Selected Map', mapName);
    queue.queuePick = false;
    queue.playerIDQueue = [];
    return content;
}
exports.default = queue;
