import axios from 'axios'
import srcData, { APIRequest } from './SRCTypes'
import runParser from './SRCRunParser';
import rb from './RequestBuilder'
import runPoster from './RunPoster';

class RequestManager {
    private newMapCheckIndex: number = 0;
    private newMapCheckLimit: number = 30;

    BeginLooping() {
        if(process.env.ENVIRONMENT === "Dev") {
            this.TestFunction();
            return;
        }

        this.CheckForNewMaps();
        this.RequestLoop();
    }

    private CheckForNewMaps() {
        srcData.requestQueue.push({
            req: rb.GetNewMapsRequest(),
            id: '',
            func: runParser.ParseAllSeriesData.bind(runParser)
        });
    }

    private CheckForNewRuns() {
        for(const key of Object.keys(srcData.allMaps)) {
            const verReq: APIRequest = {
                req : rb.GetNewVerifiedRunsRequest(key),
                id: key,
                func : runParser.ParseNewVerifiedRuns.bind(runParser)
            }
            const subReq: APIRequest = {
                req : rb.GetNewSubmittedRunsRequest(key),
                id: key,
                func : runParser.ParseNewSubmittedRuns.bind(runParser)
            }
            srcData.requestQueue.push(verReq);
            srcData.requestQueue.push(subReq);
        }
    }

    private SendRequest(item: APIRequest) {
        axios.get(item.req, {
            headers : {
                'User-Agent': 'rlsrcbot/1.0',
            },
        })
        .then(res => {
            item.func(res, item.id)
        })
        .catch(error => {
            console.error(error);
            runPoster.PostError('Error with sending request to SRC');
        })
    }

    private RequestLoop() {
        try {
            let reqProcessed = 0
            while(srcData.requestQueue.length > 0 && reqProcessed < 100) {
                const item = srcData.requestQueue.shift();
                if(item === undefined) continue;
                this.SendRequest(item);
                ++reqProcessed;
            }

            if(srcData.requestQueue.length === 0) {
                this.CheckForNewRuns();
            }

            if(this.newMapCheckIndex >= this.newMapCheckLimit) {
                this.CheckForNewMaps();
                this.CheckForNonPostedRuns();
                this.newMapCheckIndex = 0;
            } else {
                ++this.newMapCheckIndex;
            }
        } catch(error) {
            console.error(error);
            runPoster.PostError('Error in request loop');
        }
        setTimeout(this.RequestLoop.bind(this), 120000);
    }

    private CheckForNonPostedRuns() {
        const cutOffTime: Date = new Date();
        cutOffTime.setDate(cutOffTime.getDate() - 1);

        const oldRuns: string[] = [];
        for(const run in srcData.runsToPlace) {
            if(srcData.runsToPlace[run].date < cutOffTime) {
                oldRuns.push(run);
            }
        }

        for(const run of oldRuns) {
            runPoster.PostError(`Old run found with id: ${run}. Removing from runs to post queue`);
            delete srcData.runsToPlace[run];
        }
    }

    private TestFunction() {
        this.SendRequest({
            req: rb.GetNewMapsRequest(),
            id: '',
            func: runParser.ParseAllSeriesData.bind(runParser)
        });

        setTimeout(this.TestFunction2.bind(this), 20000);
    }

    private CheckForNewSub() {
        for(const key of Object.keys(srcData.allMaps)) {
            const subReq: APIRequest = {
                req : rb.GetNewSubmittedRunsRequest(key),
                id: key,
                func : runParser.ParseNewSubmittedRuns.bind(runParser)
            }
            srcData.requestQueue.push(subReq);
        }
    }

    private TestLoop() {
        try {
            let reqProcessed = 0
            while(srcData.requestQueue.length > 0 && reqProcessed < 100) {
                const item = srcData.requestQueue.shift();
                if(item === undefined) continue;
                this.SendRequest(item);
                ++reqProcessed;
            }
        } catch(error) {
            console.error(error);
            runPoster.PostError('Error in request loop');
        }
        setTimeout(this.TestLoop.bind(this), 120000);
    }

    private TestFunction2() {
        this.CheckForNewSub();
        this.TestLoop();
        return;
        const testTimesjr: Date = new Date('2022-09-14T00:53:13Z');
        const sjr3ID: string = 'y655oy46';
        srcData.allMaps[sjr3ID].latestVerifiedDate = testTimesjr;

        const testTimeyc: Date = new Date('2022-07-19T02:34:11Z');
        const yoshiID: string = '4d7ne4r6';
        srcData.allMaps[yoshiID].latestVerifiedDate = testTimeyc;

        const testTimerl: Date = new Date('2022-09-15T18:49:02Z');
        const rlID: string = '4d7eyz67';
        srcData.allMaps[rlID].latestVerifiedDate = testTimerl;

        const testTimedsec: Date = new Date('2022-05-18T22:33:35Z');
        const dsecID: string = 'y6552936';
        srcData.allMaps[dsecID].latestVerifiedDate = testTimedsec;

        const sjbID: string = 'm1mnz0jd';
        const rlssID: string = 'o1yj5rk1';

        // this.SendRequest({
        //     req: rb.GetNewVerifiedRunsRequest(dsecID),
        //     func: runParser.ParseNewVerifiedRuns.bind(runParser)
        // });

        console.log('Getting new submitted runs')
        this.SendRequest({
            req: rb.GetNewSubmittedRunsRequest(rlID),
            id: rlID,
            func: runParser.ParseNewSubmittedRuns.bind(runParser)
        });

        setTimeout(this.TestFunction3.bind(this), 10000);
    }

    private TestFunction3() {
        // if(srcData.requestQueue.length > 0) {
        //     this.SendRequest(srcData.requestQueue[0]);
        // }
        const rlID: string = '4d7eyz67';
        console.log(srcData.allMaps[rlID].oldSubmittedRuns);
        for(const run in srcData.allMaps[rlID].oldSubmittedRuns) {
            console.log(srcData.allMaps[rlID].oldSubmittedRuns[run])
            runPoster.DeleteOldSubmittedRun(srcData.allMaps[rlID].oldSubmittedRuns[run])
        }
    }
}

const requestManager: RequestManager = new RequestManager();
export default requestManager;