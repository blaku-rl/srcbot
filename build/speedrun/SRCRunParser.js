"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SRCTypes_1 = __importStar(require("./SRCTypes"));
const RunPoster_1 = __importDefault(require("./RunPoster"));
const RequestBuilder_1 = __importDefault(require("./RequestBuilder"));
class SRCRunParser {
    ignoredMaps = ["9doxkvod"];
    ParseAllSeriesData(res, id) {
        console.log("Checking for new maps");
        console.log(`${res.data.data.length} games found`);
        const curTime = new Date();
        for (const item of res.data.data) {
            try {
                if (this.ignoredMaps.includes(item.id)) {
                    continue;
                }
                const cats = {};
                for (const cat of item.categories.data) {
                    cats[cat.id] = {
                        id: cat.id,
                        name: cat.name,
                    };
                }
                const variables = {};
                for (const variable of item.variables.data) {
                    if (!variable["is-subcategory"])
                        continue;
                    const values = {};
                    for (const key of Object.keys(variable.values.values)) {
                        values[key] = variable.values.values[key].label;
                    }
                    const newVar = {
                        id: variable.id,
                        isSubCategory: variable["is-subcategory"],
                        values: values,
                    };
                    variables[variable.id] = newVar;
                }
                const levels = {};
                for (const level of item.levels.data) {
                    const newLvl = {
                        id: level.id,
                        name: level.name,
                    };
                    levels[level.id] = newLvl;
                }
                let vDate = curTime;
                let oldSubmittedRuns = {};
                if (item.id in SRCTypes_1.default.allMaps) {
                    vDate = SRCTypes_1.default.allMaps[item.id].latestVerifiedDate;
                    oldSubmittedRuns = SRCTypes_1.default.allMaps[item.id].oldSubmittedRuns;
                }
                const map = {
                    id: item.id,
                    name: item.names.international,
                    image: item.assets["cover-medium"].uri,
                    latestVerifiedDate: vDate,
                    levels: levels,
                    categories: cats,
                    variables: variables,
                    oldSubmittedRuns: oldSubmittedRuns,
                };
                SRCTypes_1.default.allMaps[item.id] = map;
                RunPoster_1.default.DevLog(`Map ${map.name} added to map list`);
            }
            catch (error) {
                console.error(error);
                RunPoster_1.default.PostError("Error getting new map data");
            }
        }
    }
    ParseNewVerifiedRuns(res, id) {
        const runs = res.data.data;
        if (runs.length === 0)
            return;
        const curId = runs[0].game;
        if (!(curId in SRCTypes_1.default.allMaps)) {
            RunPoster_1.default.PostError(`(Verified)No map id found for: ${curId}`);
            return;
        }
        const curMap = SRCTypes_1.default.allMaps[curId];
        const newestRunDate = new Date(runs[0].status["verify-date"]);
        if (newestRunDate <= curMap.latestVerifiedDate) {
            return;
        }
        console.log(`${runs.length} new verified runs found for ${curMap.name}`);
        for (const run of runs) {
            try {
                const curRunDate = new Date(run.status["verify-date"]);
                if (curRunDate <= curMap.latestVerifiedDate)
                    break;
                const newRun = this.GenerateNewRunInfo(run, curMap);
                SRCTypes_1.default.runsToPlace[run.id] = newRun;
                const leaderbordCheck = RequestBuilder_1.default.GetPlacementForRun(newRun);
                let isInQueue = false;
                for (const queueItem of SRCTypes_1.default.requestQueue) {
                    if (leaderbordCheck === queueItem.req) {
                        isInQueue = true;
                        break;
                    }
                }
                if (!isInQueue) {
                    console.log(`Adding run ${newRun.link} to placement queue`);
                    SRCTypes_1.default.requestQueue.push({
                        req: leaderbordCheck,
                        id: id,
                        func: this.ParseLeaderboardInfo.bind(this),
                    });
                }
            }
            catch (error) {
                console.error(error);
                RunPoster_1.default.PostError("Error parsing new verified run");
            }
        }
        SRCTypes_1.default.allMaps[curId].latestVerifiedDate = newestRunDate;
    }
    ParseLeaderboardInfo(res, id) {
        const runs = res.data.data.runs;
        if (runs.length === 0)
            return;
        const totalRuns = runs.length;
        for (const run of runs) {
            try {
                if (!(run.run.id in SRCTypes_1.default.runsToPlace))
                    continue;
                const curRun = SRCTypes_1.default.runsToPlace[run.run.id];
                RunPoster_1.default.PostNewVerifiedRun(curRun, run.place, totalRuns);
                delete SRCTypes_1.default.runsToPlace[run.run.id];
            }
            catch (error) {
                console.error(error);
                RunPoster_1.default.PostError("Error getting leaderboard info for runs");
            }
        }
    }
    ParseNewSubmittedRuns(res, id) {
        const runs = res.data.data;
        if (!(id in SRCTypes_1.default.allMaps)) {
            RunPoster_1.default.PostError(`(Submitted)No map id found for: ${id}`);
            return;
        }
        const curMap = SRCTypes_1.default.allMaps[id];
        if (runs.length === 0) {
            for (const oldRun in curMap.oldSubmittedRuns) {
                RunPoster_1.default.DeleteOldSubmittedRun(curMap.oldSubmittedRuns[oldRun]);
            }
            SRCTypes_1.default.allMaps[id].oldSubmittedRuns = {};
            return;
        }
        if (id !== runs[0].game) {
            RunPoster_1.default.PostError(`Id's don't match expected: ${id} result: ${runs[0].game}`);
            return;
        }
        const runChecked = {};
        for (const oldRun in curMap.oldSubmittedRuns) {
            runChecked[oldRun] = true;
        }
        for (const run of runs) {
            try {
                const newRun = this.GenerateNewRunInfo(run, curMap);
                if (newRun.id in runChecked) {
                    runChecked[newRun.id] = false;
                }
                else {
                    RunPoster_1.default.PostNewSubmittedRun(newRun);
                }
            }
            catch (error) {
                console.error(error);
                RunPoster_1.default.PostError("Error parsing new submitted runs");
            }
        }
        for (const oldRun in runChecked) {
            if (runChecked[oldRun]) {
                RunPoster_1.default.DeleteOldSubmittedRun(curMap.oldSubmittedRuns[oldRun]);
                delete SRCTypes_1.default.allMaps[id].oldSubmittedRuns[oldRun];
            }
        }
    }
    GenerateNewRunInfo(run, curMap) {
        const values = {};
        const valueNames = [];
        for (const key of Object.keys(run.values)) {
            if (!(key in curMap.variables) || !curMap.variables[key].isSubCategory)
                continue;
            values[key] = run.values[key];
            valueNames.push(curMap.variables[key].values[run.values[key]]);
        }
        const newRun = new SRCTypes_1.RunInfo();
        newRun.id = run.id;
        newRun.mapId = run.game;
        newRun.categoryId = run.category.data.id;
        newRun.level = run.level !== null ? run.level : "";
        newRun.link = run.weblink;
        newRun.time = run.times.primary_t;
        newRun.date = run.status["verify-date"];
        newRun.runners = this.ExtractRunnerInfo(run.players.data, curMap.image);
        newRun.valueNames = valueNames;
        newRun.values = values;
        return newRun;
    }
    ExtractRunnerInfo(players, backupImage) {
        const runners = [];
        for (const player of players) {
            let image = "";
            if (player.assets !== undefined &&
                player.assets.image !== undefined &&
                player.assets.image.uri !== undefined &&
                player.assets.image.uri !== null &&
                player.assets.image.uri !== "") {
                image = player.assets.image.uri;
            }
            else if (player.assets !== undefined &&
                player.assets.icon !== undefined &&
                player.assets.icon.uri !== undefined &&
                player.assets.icon.uri !== null &&
                player.assets.icon.uri !== "") {
                image = player.assets.icon.uri;
            }
            else {
                image = backupImage;
            }
            const runner = {
                runnerId: player.id,
                runnerName: player.names.international,
                runnerImage: image,
            };
            runners.push(runner);
        }
        return runners;
    }
}
const runParser = new SRCRunParser();
exports.default = runParser;
