import { CommandStruct, CustomCommand } from '../custom-types'
import qm from '../queue-manager'

function QueueCommand(content : CommandStruct) : CommandStruct {
	if (qm.queuePick) {
        content.shouldMessage = false
        return content;
    }

	if (qm.playerIDQueue.includes(content.userId)) {
		content.responseEmbed.setTitle('You\'re already in the queue').addFields(qm.queueStatus());
		return content;
	}

	qm.playerIDQueue.push(content.userId);

	if (qm.playerIDQueue.length === 1) {
		let queueTime = 10;
		const startTimeArg = content.args.shift() || '10';
		if (!isNaN(+startTimeArg)) {
			const time = parseInt(startTimeArg);
			if (time < 1 || time > 60) {
				content.responseEmbed.addFields(
						{ name: 'New queue started', value: `<@${content.userId}> has started a new queue! Type !q to join.` },
						{ name: 'Queue time not in range', value: `Time can only be between 1 and 60 minutes.\nYou have ${queueTime} minutes to join the queue` });
			} else {
				queueTime = Number(startTimeArg);
				content.responseEmbed.addField('New queue started', `<@${content.userId}> has started a new queue! Type !q to join. You have ${queueTime} minutes to join`);
			}
		} else {
			content.responseEmbed.addField('New queue started', `<@${content.userId}> has started a new queue! Type !q to join. You have ${queueTime} minutes to join`);
		}
        qm.startQueue(queueTime)
	} else {
		content.responseEmbed.addFields({ name: 'Racer joined the queue.', value: `<@${content.userId}> joined the queue` }).addFields(qm.queueStatus());
	}
    return content
}

export default {
    shortKey: 'q',
    longKey: 'queue',
    commandFunc: QueueCommand
} as CustomCommand