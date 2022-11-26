import srcData, { CategoryInfo, LevelInfo, RunInfo, SRCMap, VariableInfo, RunnerInfo, SittingSubmittedRun } from './SRCTypes'
import runPoster, { RunPoster } from './RunPoster'
import rb from './RequestBuilder'

class SRCRunParser {
    ParseAllSeriesData(res : any, id: string) {
        console.log('Checking for new maps');
        console.log(`${res.data.data.length} games found`);
        const curTime: Date = new Date();
        for (const item of res.data.data) {
            try{
                const cats: Record<string, CategoryInfo> = {};
                for(const cat of item.categories.data) {
                    cats[cat.id] = {
                        id: cat.id,
                        name: cat.name
                    };
                }

                const variables: Record<string, VariableInfo> = {};
                for(const variable of item.variables.data) {
                    if(!variable['is-subcategory']) continue;
                    const values: Record<string, string> = {};
                    for(const key of Object.keys(variable.values.values)) {
                        values[key] = variable.values.values[key].label;
                    }

                    const newVar: VariableInfo = {
                        id: variable.id,
                        isSubCategory: variable['is-subcategory'],
                        values: values
                    }
                    variables[variable.id] = newVar;
                }

                const levels: Record<string, LevelInfo> = {};
                for(const level of item.levels.data) {
                    const newLvl: LevelInfo = {
                        id: level.id,
                        name: level.name
                    }
                    levels[level.id] = newLvl;
                }

                let vDate: Date = curTime;
                let oldSubmittedRuns: Record<string, SittingSubmittedRun> = {};
                if(item.id in srcData.allMaps) {
                    vDate = srcData.allMaps[item.id].latestVerifiedDate;
                    oldSubmittedRuns = srcData.allMaps[item.id].oldSubmittedRuns;
                }

                const map: SRCMap = {
                    id: item.id,
                    name: item.names.international,
                    image: item.assets["cover-medium"].uri,
                    latestVerifiedDate: vDate,
                    levels: levels,
                    categories: cats,
                    variables: variables,
                    oldSubmittedRuns: oldSubmittedRuns
                };
                srcData.allMaps[item.id] = map;
            } catch(error) {
                console.error(error);
                runPoster.PostError('Error getting new map data');
            }
        }
    }
    
    ParseNewVerifiedRuns(res : any, id: string) {
        const runs = res.data.data
        if (runs.length === 0) return
        
        const curId: string = runs[0].game
        if(!(curId in srcData.allMaps)) {
            runPoster.PostError(`(Verified)No map id found for: ${curId}`);
            return;
        }
        const curMap = srcData.allMaps[curId];

        const newestRunDate: Date = new Date(runs[0].status["verify-date"])
        if (newestRunDate <= curMap.latestVerifiedDate) return
    
        for (const run of runs) {
            try {
                const curRunDate: Date = new Date(run.status["verify-date"]);
                if (curRunDate <= curMap.latestVerifiedDate) break

                const newRun: RunInfo = this.GenerateNewRunInfo(run, curMap);
                srcData.runsToPlace[run.id] = newRun;
                const leaderbordCheck: string = rb.GetPlacementForRun(newRun);

                let isInQueue: boolean = false;
                for(const queueItem of srcData.requestQueue) {
                    if(leaderbordCheck === queueItem.req) {
                        isInQueue = true;
                        break;
                    }
                }

                if(!isInQueue) {
                    srcData.requestQueue.push({
                        req: leaderbordCheck,
                        id: id,
                        func: this.ParseLeaderboardInfo.bind(this)
                    });
                }
            } catch(error) {
                console.error(error);
                runPoster.PostError('Error parsing new verified run');
            }
        }
        
        srcData.allMaps[curId].latestVerifiedDate = newestRunDate
    }

    ParseLeaderboardInfo(res: any, id: string) {
        const runs: any = res.data.data.runs;
        if(runs.length === 0) return;

        const totalRuns: number = runs.length;

        for(const run of runs) {
            try {
                if(!(run.run.id in srcData.runsToPlace)) continue;
                const curRun = srcData.runsToPlace[run.run.id];
                runPoster.PostNewVerifiedRun(curRun, run.place, totalRuns);
                delete srcData.runsToPlace[run.run.id];
            } catch(error) {
                console.error(error);
                runPoster.PostError('Error getting leaderboard info for runs');
            }
        }
    }

    ParseNewSubmittedRuns(res : any, id: string) {
        const runs = res.data.data

        if(!(id in srcData.allMaps)) {
            runPoster.PostError(`(Submitted)No map id found for: ${id}`);
            return;
        }

        const curMap = srcData.allMaps[id];

        if (runs.length === 0) {
            for(const oldRun in curMap.oldSubmittedRuns) {
                runPoster.DeleteOldSubmittedRun(curMap.oldSubmittedRuns[oldRun]);
            }
            srcData.allMaps[id].oldSubmittedRuns = {};
            return;
        }

        if(id !== runs[0].game) {
            runPoster.PostError(`Id's don't match expected: ${id} result: ${runs[0].game}`);
            return;
        }

        const runChecked: Record<string, boolean> = {};
        for(const oldRun in curMap.oldSubmittedRuns) {
            runChecked[oldRun] = true;
        }
    
        for (const run of runs) {
            try {
                const newRun: RunInfo = this.GenerateNewRunInfo(run, curMap);

                if(newRun.id in runChecked) {
                    runChecked[newRun.id] = false;
                } else {
                    runPoster.PostNewSubmittedRun(newRun);
                }
            } catch(error) {
                console.error(error);
                runPoster.PostError('Error parsing new submitted runs');
            }
        }

        for(const oldRun in runChecked) {
            if(runChecked[oldRun]) {
                runPoster.DeleteOldSubmittedRun(curMap.oldSubmittedRuns[oldRun]);
                delete srcData.allMaps[id].oldSubmittedRuns[oldRun];
            }
        }
    }

    private GenerateNewRunInfo(run: any, curMap: SRCMap) : RunInfo {
        const values: Record<string, string> = {};
        const valueNames: string[] = [];
        for(const key of Object.keys(run.values)) {
            if(!(key in curMap.variables) || !curMap.variables[key].isSubCategory) continue;
            values[key] = run.values[key];
            valueNames.push(curMap.variables[key].values[run.values[key]]);
        }

        const newRun: RunInfo = new RunInfo();
        newRun.id = run.id;
        newRun.mapId = run.game;
        newRun.categoryId = run.category.data.id;
        newRun.level = run.level !== null ? run.level : '';
        newRun.link = run.weblink;
        newRun.time = run.times.primary_t;
        newRun.date = run.status["verify-date"];
        newRun.runners = this.ExtractRunnerInfo(run.players.data, curMap.image);
        newRun.valueNames = valueNames;
        newRun.values = values;

        return newRun;
    }

    private ExtractRunnerInfo(players : any, backupImage : string) : RunnerInfo[] {
        const runners : RunnerInfo[] = [];
    
        for (const player of players) {
            let image : string = "";
            if (player.assets !== undefined && player.assets.image !== undefined && player.assets.image.uri !== undefined && player.assets.image.uri !== null && player.assets.image.uri !== '') {
                image = player.assets.image.uri;
            } else if(player.assets !== undefined && player.assets.icon !== undefined && player.assets.icon.uri !== undefined && player.assets.icon.uri !== null && player.assets.icon.uri !== '') {
                image = player.assets.icon.uri;
            } else {
                image = backupImage;
            }
    
            const runner : RunnerInfo = {
                runnerId: player.id,
                runnerName: player.names.international,
                runnerImage: image
            }
            runners.push(runner);
        }
    
        return runners;
    }
}

const runParser: SRCRunParser = new SRCRunParser();
export default runParser;