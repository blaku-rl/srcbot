import { CommandStruct, CustomCommand } from '../custom-types'
import qm from '../queue-manager'

function LeaveCommand(content : CommandStruct) : CommandStruct {
	if (!qm.playerIDQueue.includes(content.userId)) {
		if (qm.playerIDQueue.length === 0) {
			content.responseEmbed.addField('Queue has not been started', 'Use !q to start a new queue')
		}
		else {
			content.responseEmbed.setTitle('You\'re not in the queue').addFields(qm.queueStatus())
		}
        return content
	}

	const index = qm.playerIDQueue.indexOf(content.userId);
	if (index > -1) {
		qm.playerIDQueue.splice(index, 1);
	}

	if (qm.playerIDQueue.length === 0) {
		content.responseEmbed.addFields(
            { name: 'Racer left the queue.', value: `<@${content.userId}> left the queue` },
            { name: 'Queue Empty', value: 'There is nobody in the queue' });
        qm.stopQueue()
	} else {
		content.responseEmbed.addField('Racer left the queue.', `<@${content.userId}> left the queue`).addFields(qm.queueStatus());
	}
    return content
}

export default {
    shortKey: 'l',
    longKey: 'leave',
    commandFunc: LeaveCommand
} as CustomCommand

