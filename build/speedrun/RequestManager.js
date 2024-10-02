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
    newMapCheckIndex = 0;
    newMapCheckLimit = 30;
    requestLoopLength = 120000;
    maxRequests = 100;
    BeginLooping() {
        this.CheckForNewMaps();
        this.RequestLoop();
    }
    CheckForNewMaps() {
        SRCTypes_1.default.requestQueue.push({
            req: RequestBuilder_1.default.GetNewMapsRequest(),
            id: "",
            func: SRCRunParser_1.default.ParseAllSeriesData.bind(SRCRunParser_1.default),
        });
        console.log("Maps request added to the queue");
    }
    CheckForNewRuns() {
        for (const key of Object.keys(SRCTypes_1.default.allMaps)) {
            const verReq = {
                req: RequestBuilder_1.default.GetNewVerifiedRunsRequest(key),
                id: key,
                func: SRCRunParser_1.default.ParseNewVerifiedRuns.bind(SRCRunParser_1.default),
            };
            const subReq = {
                req: RequestBuilder_1.default.GetNewSubmittedRunsRequest(key),
                id: key,
                func: SRCRunParser_1.default.ParseNewSubmittedRuns.bind(SRCRunParser_1.default),
            };
            SRCTypes_1.default.requestQueue.push(verReq);
            SRCTypes_1.default.requestQueue.push(subReq);
        }
    }
    SendRequest(item) {
        RunPoster_1.default.DevLog(`Sending request ${item.req}`);
        axios_1.default
            .get(item.req, {
            headers: {
                "User-Agent": "rlsrcbot/1.0",
            },
        })
            .then((res) => {
            item.func(res, item.id);
        })
            .catch((error) => {
            console.error(error);
            RunPoster_1.default.PostError("Error with sending request to SRC");
        });
    }
    RequestLoop() {
        try {
            let reqProcessed = 0;
            while (SRCTypes_1.default.requestQueue.length > 0 &&
                reqProcessed < this.maxRequests) {
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
            RunPoster_1.default.PostError("Error in request loop");
        }
        setTimeout(this.RequestLoop.bind(this), this.requestLoopLength);
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
}
const requestManager = new RequestManager();
exports.default = requestManager;
