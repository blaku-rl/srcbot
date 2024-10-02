import axios from "axios";
import srcData, { APIRequest } from "./SRCTypes";
import runParser from "./SRCRunParser";
import rb from "./RequestBuilder";
import runPoster from "./RunPoster";

class RequestManager {
  private newMapCheckLimit: number = 10;
  private newMapCheckIndex: number = this.newMapCheckLimit;
  private requestLoopLength: number = 1000;

  BeginLooping() {
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
          "User-Agent": "rlsrcbot/1.2",
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
      if (this.newMapCheckIndex >= this.newMapCheckLimit) {
        this.CheckForNewMaps();
        this.CheckForNonPostedRuns();
        this.newMapCheckIndex = 0;
      }

      if (srcData.requestQueue.length === 0) {
        this.CheckForNewRuns();
        ++this.newMapCheckIndex;
      }

      if (srcData.requestQueue.length === 0) {
        throw new Error("Request queue should not be empty in loop");
      }

      const item = srcData.requestQueue.shift();
      if (item === undefined) {
        throw new Error("Item in request queue is undefined");
      }
      this.SendRequest(item);
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
