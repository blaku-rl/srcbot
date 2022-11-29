import { RunInfo } from './SRCTypes'

class RequestBuilder {
    private runsStart: String = 'https://www.speedrun.com/api/v1/runs?game=';
    private verifiedEnd: String = '&status=verified&orderby=verify-date&direction=desc&embed=category,players&max=200';
    private submittedEnd: String = '&status=new&orderby=submitted&direction=desc&embed=category,players&max=200';
    private runCheckStart: String = 'https://www.speedrun.com/api/v1/leaderboards/';

    GetNewVerifiedRunsRequest(id: string) : string {
        return `${this.runsStart}${id}${this.verifiedEnd}`;
    }

    GetNewSubmittedRunsRequest(id: string) : string {
        return `${this.runsStart}${id}${this.submittedEnd}`;
    }

    GetNewMapsRequest() : string {
        return 'https://www.speedrun.com/api/v1/series/g7q25m57/games?max=200&embed=levels,categories,variables';
    }

    GetPlacementForRun(run: RunInfo) : string {
        let valStr: string = '';
        for(const key of Object.keys(run.values)) {
            valStr += `var-${key}=${run.values[key]}&`;
        }
        valStr = valStr.substring(0, valStr.length - 1);

        if(run.level !== '') {
            return `${this.runCheckStart}${run.mapId}/level/${run.level}/${run.categoryId}?${valStr}`;
        } else {
            return `${this.runCheckStart}${run.mapId}/category/${run.categoryId}?${valStr}`;
        }
    }
}

const rb = new RequestBuilder();
export default rb;