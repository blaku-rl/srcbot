import { CommandStruct, CustomCommand } from '../custom-types'

function BlakuCommand(content : CommandStruct) {
	content.responseEmbed.setTitle('My master who I aim to please. From a cool place though');
    return content
}

export default {
    shortKey: 'blaku',
    commandFunc: BlakuCommand
} as CustomCommand