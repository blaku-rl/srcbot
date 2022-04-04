import { CommandStruct, CustomCommand } from '../custom-types'
import qm from '../queue-manager'

function StatusCommand(content : CommandStruct) : CommandStruct {
	if (qm.playerIDQueue.length === 0) {
		content.responseEmbed.setTitle('Queue Status').addField('Queue is empty', 'Be the first to join a queue with !q')
	} else if (qm.queuePick) {
        const status = qm.queueStatus()
		content.responseEmbed.setTitle('Queue Status').addField(status[0].name, status[0].value)
	} else {
		content.responseEmbed.setTitle('Queue Status').addFields(qm.queueStatus())
	}
    return content
}

export default {
    shortKey: 's',
    longKey: 'status',
    commandFunc: StatusCommand
} as CustomCommand