import { FetchStatus, FetchStatusAndError } from "@store/fetchData";
import { OperationStatus } from "../types/operationTypes";

export interface OperationStatusIf {
  operationStatusList: OperationStatus[];
  totalNumOperationStatus: number;
  isAutomaticRefresh: boolean;
  automaticRefreshTimer: number;

  getOperationStatusListFetchAndError: FetchStatusAndError;
  
  getOperationStatusList: (offset: number, limit: number) => Promise<FetchStatus>;
  toggleAutomaticRefresh: () => void;
  setAutomaticRefreshTimer: (timer: number) => void;
  operationStatusReset: () => void;
}
