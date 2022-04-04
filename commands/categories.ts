import { CommandStruct, CustomCommand } from '../custom-types'
import categoriesInfo from '../categories-importer'

function CategoriesCommand(content : CommandStruct) : CommandStruct {
	content.responseEmbed.setTitle('Racing Categories').addFields(categoriesInfo.categoriesFields)
    return content
}

export default {
    shortKey: 'cat',
    longKey: 'categories',
    commandFunc: CategoriesCommand
} as CustomCommand