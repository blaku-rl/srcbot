"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequestBuilder {
    constructor() {
        this.runsStart = 'https://www.speedrun.com/api/v1/runs?game=';
        this.verifiedEnd = '&status=verified&orderby=verify-date&direction=desc&embed=category,players&max=200';
        this.submittedEnd = '&status=new&orderby=submitted&direction=desc&embed=category,players&max=200';
        this.runCheckStart = 'https://www.speedrun.com/api/v1/leaderboards/';
    }
    GetNewVerifiedRunsRequest(id) {
        return `${this.runsStart}${id}${this.verifiedEnd}`;
    }
    GetNewSubmittedRunsRequest(id) {
        return `${this.runsStart}${id}${this.submittedEnd}`;
    }
    GetNewMapsRequest() {
        return 'https://www.speedrun.com/api/v1/series/g7q25m57/games?max=200&embed=levels,categories,variables';
    }
    GetPlacementForRun(run) {
        let valStr = '';
        for (const key of Object.keys(run.values)) {
            valStr += `var-${key}=${run.values[key]}&`;
        }
        valStr = valStr.substring(0, valStr.length - 1);
        if (run.level !== '') {
            return `${this.runCheckStart}${run.mapId}/level/${run.level}/${run.categoryId}?${valStr}`;
        }
        else {
            return `${this.runCheckStart}${run.mapId}/category/${run.categoryId}?${valStr}`;
        }
    }
}
const rb = new RequestBuilder();
exports.default = rb;
