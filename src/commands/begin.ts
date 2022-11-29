import { CommandStruct, CustomCommand } from '../custom-types'
import qm from '../queue-manager'

function BeginCommand(content : CommandStruct) : CommandStruct {
	if (qm.playerIDQueue.length === 0 || !qm.playerIDQueue.includes(content.userId)) {
		content.responseEmbed.addFields({ name: 'You\'re not in the queue.', value: 'Join the queue to start it' });
        return content
	}
	if (!qm.queuePick) {
        qm.popQueue()
	}
    content.shouldMessage = false
    return content
}

export default {
    shortKey: 'b',
    longKey: 'begin',
    commandFunc: BeginCommand
} as CustomCommand