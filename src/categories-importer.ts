import rawCategoryData from './categories.json'
import { FieldInfo, CategoryInfo, Category } from './custom-types';

const categoriesAny = (<any>rawCategoryData).categories;
const categoriesFields : FieldInfo[] = [];
const categoriesJson : Category[] = [];
let categoriesString = '';

for (const cat of categoriesAny) {
	categoriesFields.push({
		name: cat.name,
		value: cat.description,
	});

	categoriesJson.push({
		name: cat.name,
		description: cat.description,
		command: cat.command,
		maps: []
	})

	for (const map of cat.maps) {
		categoriesJson[categoriesJson.length - 1].maps.push({
			name: map.name,
			srcID: map.srcID
		})
	}

	categoriesString += `!${cat.command} ${cat.name}\n`;
}
categoriesString += '!rand Random Category';

export default {
    categoriesFields: categoriesFields,
    categoriesString: categoriesString,
	categoriesJson: categoriesJson
} as CategoryInfo