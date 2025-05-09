export type APIRequest = {
  req: string;
  id: string;
  func: (arg0: any, arg1: string) => void;
};

export type VariableInfo = {
  id: string;
  isSubCategory: boolean;
  values: Record<string, string>;
};

export type CategoryInfo = {
  id: string;
  name: string;
};

export type LevelInfo = {
  id: string;
  name: string;
};

export type SRCMap = {
  id: string;
  name: string;
  image: string;
  latestVerifiedDate: Date;
  levels: Record<string, LevelInfo>;
  categories: Record<string, CategoryInfo>;
  variables: Record<string, VariableInfo>;
  oldSubmittedRuns: Record<string, SittingSubmittedRun>;
};

export type RunnerInfo = {
  runnerId: string;
  runnerName: string;
  runnerImage: string;
};

export class RunInfo {
  id: string = "";
  mapId: string = "";
  categoryId: string = "";
  level: string = "";
  link: string = "";
  time: number = 0;
  date: Date = new Date();
  runners: RunnerInfo[] = [];
  valueNames: string[] = [];
  values: Record<string, string> = {};

  GetRunnersString(): string {
    if (this.runners.length === 0) return "";

    let rString = "";
    let index: number;
    for (index = 0; index < this.runners.length - 1; ++index) {
      rString += `${this.runners[index].runnerName}, `;
    }
    rString += this.runners[index].runnerName;

    return rString;
  }

  GetRunnerImage(): string {
    let image: string = srcData.allMaps[this.mapId].image;
    for (const runner of this.runners) {
      if (runner.runnerImage !== image) {
        image = runner.runnerImage;
        break;
      }
    }

    return image;
  }

  GetTimeString(): string {
    let totalTime = this.time.toString();
    let milliStr = "000";
    let remainTime = 0;
    const res = (totalTime + "").split(".");
    if (res.length === 2) milliStr = res[1].padEnd(3, "0");
    remainTime = Number(res[0]);

    const hours = Math.floor(remainTime / 3600);
    remainTime = remainTime % 3600;

    const minutes = Math.floor(remainTime / 60);
    const seconds = remainTime % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s ${milliStr}ms`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ${milliStr}ms`;
    }

    return `${seconds}s ${milliStr}ms`;
  }

  private GetValuesString(values: string[]): string {
    if (values.length === 0) return "";

    let valueStr: string = "";

    for (const val in values) {
      valueStr += `${values[val]}, `;
    }
    valueStr = valueStr.substring(0, valueStr.length - 2);

    return `(${valueStr})`;
  }

  GetAllCategoryInfo(): string {
    let categoryStr: string = "";
    if (this.level === "") {
      categoryStr = `${srcData.allMaps[this.mapId].categories[this.categoryId].name} ${this.GetValuesString(this.valueNames)}`;
    } else {
      const newValues: string[] = [];
      newValues.push(
        srcData.allMaps[this.mapId].categories[this.categoryId].name,
      );
      for (const val in this.valueNames) {
        newValues.push(val);
      }
      categoryStr = `${srcData.allMaps[this.mapId].levels[this.level].name} ${this.GetValuesString(newValues)}`;
    }
    return categoryStr;
  }
}

export type SittingSubmittedRun = {
  messageID: string;
  run: RunInfo;
};

type SRCData = {
  requestQueue: APIRequest[];
  allMaps: Record<string, SRCMap>;
  runsToPlace: Record<string, RunInfo>;
};

const srcData: SRCData = {
  requestQueue: [],
  allMaps: {},
  runsToPlace: {},
};

export default srcData;
