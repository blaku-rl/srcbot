"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunInfo = void 0;
class RunInfo {
    id = "";
    mapId = "";
    categoryId = "";
    level = "";
    link = "";
    time = 0;
    date = new Date();
    runners = [];
    valueNames = [];
    values = {};
    GetRunnersString() {
        if (this.runners.length === 0)
            return "";
        let rString = "";
        let index;
        for (index = 0; index < this.runners.length - 1; ++index) {
            rString += `${this.runners[index].runnerName}, `;
        }
        rString += this.runners[index].runnerName;
        return rString;
    }
    GetRunnerImage() {
        let image = srcData.allMaps[this.mapId].image;
        for (const runner of this.runners) {
            if (runner.runnerImage !== image) {
                image = runner.runnerImage;
                break;
            }
        }
        return image;
    }
    LameConversion(time, limit) {
        let loops = 1;
        while (time > limit * loops) {
            ++loops;
        }
        return loops - 1;
    }
    GetTimeString() {
        let totalTime = this.time.toString();
        let milliseconds = 0;
        let remainTime = 0;
        const res = (totalTime + "").split(".");
        if (res.length === 2) {
            let correctLenMillStr = res[1];
            while (correctLenMillStr.length < 3) {
                correctLenMillStr += "0";
            }
            milliseconds = Number(correctLenMillStr);
        }
        remainTime = Number(res[0]);
        const hours = this.LameConversion(remainTime, 3600);
        remainTime = remainTime - hours * 3600;
        const minutes = this.LameConversion(remainTime, 60);
        const seconds = remainTime - minutes * 60;
        let milliStr = "";
        if (milliseconds < 10) {
            milliStr = `00${milliseconds}`;
        }
        else if (milliseconds < 100) {
            milliStr = `0${milliseconds}`;
        }
        else {
            milliStr = milliseconds.toString();
        }
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s ${milliStr}ms`;
        }
        if (minutes > 0) {
            return `${minutes}m ${seconds}s ${milliStr}ms`;
        }
        return `${seconds}s ${milliStr}ms`;
    }
    GetValuesString(values) {
        if (values.length === 0)
            return "";
        let valueStr = "";
        for (const val in values) {
            valueStr += `${values[val]}, `;
        }
        valueStr = valueStr.substring(0, valueStr.length - 2);
        return `(${valueStr})`;
    }
    GetAllCategoryInfo() {
        let categoryStr = "";
        if (this.level === "") {
            categoryStr = `${srcData.allMaps[this.mapId].categories[this.categoryId].name} ${this.GetValuesString(this.valueNames)}`;
        }
        else {
            const newValues = [];
            newValues.push(srcData.allMaps[this.mapId].categories[this.categoryId].name);
            for (const val in this.valueNames) {
                newValues.push(val);
            }
            categoryStr = `${srcData.allMaps[this.mapId].levels[this.level].name} ${this.GetValuesString(newValues)}`;
        }
        return categoryStr;
    }
}
exports.RunInfo = RunInfo;
const srcData = {
    requestQueue: [],
    allMaps: {},
    runsToPlace: {},
};
exports.default = srcData;
