"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const categories_json_1 = __importDefault(require("./categories.json"));
const categoriesAny = categories_json_1.default.categories;
const categoriesFields = [];
const categoriesJson = [];
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
    });
    for (const map of cat.maps) {
        categoriesJson[categoriesJson.length - 1].maps.push({
            name: map.name,
            srcID: map.srcID
        });
    }
    categoriesString += `!${cat.command} ${cat.name}\n`;
}
categoriesString += '!rand Random Category';
exports.default = {
    categoriesFields: categoriesFields,
    categoriesString: categoriesString,
    categoriesJson: categoriesJson
};
