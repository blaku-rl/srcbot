import axios from "axios";
import srcData, { APIRequest } from "./SRCTypes";
import runParser from "./SRCRunParser";
import rb from "./RequestBuilder";
import runPoster from "./RunPoster";

class RequestManager {
  private newMapCheckIndex: number = 0;
  private newMapCheckLimit: number = 30;
  private requestLoopLength: number = 120000;
  private maxRequests: number = 100;

  BeginLooping() {
    this.CheckForNewMaps();
    this.RequestLoop();
  }

  private CheckForNewMaps() {
    srcData.requestQueue.push({
      req: rb.GetNewMapsRequest(),
      id: "",
      func: runParser.ParseAllSeriesData.bind(runParser),
    });
    console.log("Maps request added to the queue");
  }

  private CheckForNewRuns() {
    for (const key of Object.keys(srcData.allMaps)) {
      const verReq: APIRequest = {
        req: rb.GetNewVerifiedRunsRequest(key),
        id: key,
        func: runParser.ParseNewVerifiedRuns.bind(runParser),
      };
      const subReq: APIRequest = {
        req: rb.GetNewSubmittedRunsRequest(key),
        id: key,
        func: runParser.ParseNewSubmittedRuns.bind(runParser),
      };
      srcData.requestQueue.push(verReq);
      srcData.requestQueue.push(subReq);
    }
  }

  private SendRequest(item: APIRequest) {
    runPoster.DevLog(`Sending request ${item.req}`);
    axios
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
        runPoster.PostError("Error with sending request to SRC");
      });
  }

  private RequestLoop() {
    try {
      let reqProcessed = 0;
      while (
        srcData.requestQueue.length > 0 &&
        reqProcessed < this.maxRequests
      ) {
        const item = srcData.requestQueue.shift();
        if (item === undefined) continue;
        this.SendRequest(item);
        ++reqProcessed;
      }

      if (srcData.requestQueue.length === 0) {
        this.CheckForNewRuns();
      }

      if (this.newMapCheckIndex >= this.newMapCheckLimit) {
        this.CheckForNewMaps();
        this.CheckForNonPostedRuns();
        this.newMapCheckIndex = 0;
      } else {
        ++this.newMapCheckIndex;
      }
    } catch (error) {
      console.error(error);
      runPoster.PostError("Error in request loop");
    }
    setTimeout(this.RequestLoop.bind(this), this.requestLoopLength);
  }

  private CheckForNonPostedRuns() {
    const cutOffTime: Date = new Date();
    cutOffTime.setDate(cutOffTime.getDate() - 1);

    const oldRuns: string[] = [];
    for (const run in srcData.runsToPlace) {
      if (srcData.runsToPlace[run].date < cutOffTime) {
        oldRuns.push(run);
      }
    }

    for (const run of oldRuns) {
      runPoster.PostError(
        `Old run found with id: ${run}. Removing from runs to post queue`,
      );
      delete srcData.runsToPlace[run];
    }
  }
}

const requestManager: RequestManager = new RequestManager();
export default requestManager;
