import { FetchStatus, FetchStatusAndError } from "@utils/fetchData";
import { OperationStatus } from "../types/operationTypes";

export interface OperationStatusIf {
  operationStatusList: OperationStatus[];
  totalNumOperationStatus: number;
  getOperationStatusListFetchAndError: FetchStatusAndError;
  isAutomaticRefresh: boolean;
  automaticRefreshTimer: number;
  
  getOperationStatusList: (offset: number, limit: number, reload?: boolean) => Promise<FetchStatus>;
  toggleAutomaticRefresh: () => void;
  setAutomaticRefreshTimer: (timer: number) => void;
  operationStatusReset: () => void;
}
