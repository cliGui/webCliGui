import { FetchStatus, FetchStatusAndError } from "../utils/fetchData";
import { OperationStatus } from "./operationTypes";

export interface OperationStatusIf {
  operationStatusList: OperationStatus[];
  numOperationStatus: number;
  getOperationStatusListFetchAndError: FetchStatusAndError;
  isAutomaticRefresh: boolean;
  automaticRefreshTimer: number;
  
  getOperationStatusList: (offset: number, limit: number) => Promise<FetchStatus>;
  toggleAutomaticRefresh: () => void;
  setAutomaticRefreshTimer: (timer: number) => void;
}
