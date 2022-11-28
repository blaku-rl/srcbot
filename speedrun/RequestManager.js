"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const SRCTypes_1 = __importDefault(require("./SRCTypes"));
const SRCRunParser_1 = __importDefault(require("./SRCRunParser"));
const RequestBuilder_1 = __importDefault(require("./RequestBuilder"));
const RunPoster_1 = __importDefault(require("./RunPoster"));
class RequestManager {
    constructor() {
        this.newMapCheckIndex = 0;
        this.newMapCheckLimit = 30;
    }
    BeginLooping() {
        if (process.env.ENVIRONMENT === "Dev") {
            this.TestFunction();
            return;
        }
        this.CheckForNewMaps();
        this.RequestLoop();
    }
    CheckForNewMaps() {
        SRCTypes_1.default.requestQueue.push({
            req: RequestBuilder_1.default.GetNewMapsRequest(),
            id: '',
            func: SRCRunParser_1.default.ParseAllSeriesData.bind(SRCRunParser_1.default)
        });
    }
    CheckForNewRuns() {
        for (const key of Object.keys(SRCTypes_1.default.allMaps)) {
            const verReq = {
                req: RequestBuilder_1.default.GetNewVerifiedRunsRequest(key),
                id: key,
                func: SRCRunParser_1.default.ParseNewVerifiedRuns.bind(SRCRunParser_1.default)
            };
            const subReq = {
                req: RequestBuilder_1.default.GetNewSubmittedRunsRequest(key),
                id: key,
                func: SRCRunParser_1.default.ParseNewSubmittedRuns.bind(SRCRunParser_1.default)
            };
            SRCTypes_1.default.requestQueue.push(verReq);
            SRCTypes_1.default.requestQueue.push(subReq);
        }
    }
    SendRequest(item) {
        axios_1.default.get(item.req, {
            headers: {
                'User-Agent': 'rlsrcbot/1.0',
            },
        })
            .then(res => {
            item.func(res, item.id);
        })
            .catch(error => {
            console.error(error);
            RunPoster_1.default.PostError('Error with sending request to SRC');
        });
    }
    RequestLoop() {
        try {
            let reqProcessed = 0;
            while (SRCTypes_1.default.requestQueue.length > 0 && reqProcessed < 100) {
                const item = SRCTypes_1.default.requestQueue.shift();
                if (item === undefined)
                    continue;
                this.SendRequest(item);
                ++reqProcessed;
            }
            if (SRCTypes_1.default.requestQueue.length === 0) {
                this.CheckForNewRuns();
            }
            if (this.newMapCheckIndex >= this.newMapCheckLimit) {
                this.CheckForNewMaps();
                this.CheckForNonPostedRuns();
                this.newMapCheckIndex = 0;
            }
            else {
                ++this.newMapCheckIndex;
            }
        }
        catch (error) {
            console.error(error);
            RunPoster_1.default.PostError('Error in request loop');
        }
        setTimeout(this.RequestLoop.bind(this), 120000);
    }
    CheckForNonPostedRuns() {
        const cutOffTime = new Date();
        cutOffTime.setDate(cutOffTime.getDate() - 1);
        const oldRuns = [];
        for (const run in SRCTypes_1.default.runsToPlace) {
            if (SRCTypes_1.default.runsToPlace[run].date < cutOffTime) {
                oldRuns.push(run);
            }
        }
        for (const run of oldRuns) {
            RunPoster_1.default.PostError(`Old run found with id: ${run}. Removing from runs to post queue`);
            delete SRCTypes_1.default.runsToPlace[run];
        }
    }
    TestFunction() {
        this.SendRequest({
            req: RequestBuilder_1.default.GetNewMapsRequest(),
            id: '',
            func: SRCRunParser_1.default.ParseAllSeriesData.bind(SRCRunParser_1.default)
        });
        setTimeout(this.TestFunction2.bind(this), 20000);
    }
    CheckForNewSub() {
        for (const key of Object.keys(SRCTypes_1.default.allMaps)) {
            const subReq = {
                req: RequestBuilder_1.default.GetNewSubmittedRunsRequest(key),
                id: key,
                func: SRCRunParser_1.default.ParseNewSubmittedRuns.bind(SRCRunParser_1.default)
            };
            SRCTypes_1.default.requestQueue.push(subReq);
        }
    }
    TestLoop() {
        try {
            let reqProcessed = 0;
            while (SRCTypes_1.default.requestQueue.length > 0 && reqProcessed < 100) {
                const item = SRCTypes_1.default.requestQueue.shift();
                if (item === undefined)
                    continue;
                this.SendRequest(item);
                ++reqProcessed;
            }
        }
        catch (error) {
            console.error(error);
            RunPoster_1.default.PostError('Error in request loop');
        }
        setTimeout(this.TestLoop.bind(this), 120000);
    }
    TestFunction2() {
        const testTimesjr = new Date('2022-09-14T00:53:13Z');
        const sjr3ID = 'y655oy46';
        SRCTypes_1.default.allMaps[sjr3ID].latestVerifiedDate = testTimesjr;
        const testTimeyc = new Date('2022-07-19T02:34:41Z');
        const yoshiID = '4d7ne4r6';
        SRCTypes_1.default.allMaps[yoshiID].latestVerifiedDate = testTimeyc;
        const testTimerl = new Date('2022-09-15T18:49:02Z');
        const rlID = '4d7eyz67';
        SRCTypes_1.default.allMaps[rlID].latestVerifiedDate = testTimerl;
        const testTimedsec = new Date('2022-05-18T22:33:35Z');
        const dsecID = 'y6552936';
        SRCTypes_1.default.allMaps[dsecID].latestVerifiedDate = testTimedsec;
        const sjbID = 'm1mnz0jd';
        const rlssID = 'o1yj5rk1';
        // this.SendRequest({
        //     req: rb.GetNewVerifiedRunsRequest(dsecID),
        //     func: runParser.ParseNewVerifiedRuns.bind(runParser)
        // });
        console.log('Getting new verified runs');
        this.SendRequest({
            req: RequestBuilder_1.default.GetNewVerifiedRunsRequest(yoshiID),
            id: yoshiID,
            func: SRCRunParser_1.default.ParseNewVerifiedRuns.bind(SRCRunParser_1.default)
        });
        setTimeout(this.TestFunction3.bind(this), 10000);
    }
    TestFunction3() {
        if (SRCTypes_1.default.requestQueue.length > 0) {
            this.SendRequest(SRCTypes_1.default.requestQueue[0]);
        }
        // const yoshiID: string = '4d7ne4r6';
        // console.log(srcData.allMaps[yoshiID].oldSubmittedRuns);
        // for(const run in srcData.allMaps[yoshiID].oldSubmittedRuns) {
        //     console.log(srcData.allMaps[yoshiID].oldSubmittedRuns[run])
        //     runPoster.DeleteOldSubmittedRun(srcData.allMaps[yoshiID].oldSubmittedRuns[run])
        // }
    }
}
const requestManager = new RequestManager();
exports.default = requestManager;
