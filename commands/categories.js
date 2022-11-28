"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const categories_importer_1 = __importDefault(require("../categories-importer"));
function CategoriesCommand(content) {
    content.responseEmbed.setTitle('Racing Categories').addFields(categories_importer_1.default.categoriesFields);
    return content;
}
exports.default = {
    shortKey: 'cat',
    longKey: 'categories',
    commandFunc: CategoriesCommand
};
