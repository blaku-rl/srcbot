"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const help_1 = __importDefault(require("./help"));
const blaku_1 = __importDefault(require("./blaku"));
const categories_1 = __importDefault(require("./categories"));
const queue_1 = __importDefault(require("./queue"));
const leave_1 = __importDefault(require("./leave"));
const begin_1 = __importDefault(require("./begin"));
const status_1 = __importDefault(require("./status"));
exports.default = [
    help_1.default,
    blaku_1.default,
    categories_1.default,
    queue_1.default,
    leave_1.default,
    begin_1.default,
    status_1.default
];
