import { StateCreator  } from 'zustand';
import { GetFunction, SetFunction } from './dataStoreTypes';
import { OperationStatusIf } from './operationStatusIf';
import { DataStoreIf } from './dataStoreIf';
import { OperationStatus } from './operationTypes';
import fetchData, { FetchState, FetchStatus, FetchStatusAndError } from '@utils/fetchData';

const doGetOperationStatusList = async (offset: number, limit: number, get: GetFunction, set: SetFunction): Promise<FetchStatus> => {
  if (get().operationStatus.getOperationStatusListFetchAndError.fetchStatus === FetchState.Loading) {
    return FetchState.Loading;
  }

  const setFandE = (fandE: FetchStatusAndError, fAndEText: string) =>
    set(state => { state.operationStatus.getOperationStatusListFetchAndError = fandE }, false, 
      `getOperationStatusList_${fAndEText}`);

  interface OperationStatusListDataJson {
    num_status: number,
    offset: number,
    status_data: OperationStatusJson[],
  }

  const setData = (rawData: OperationStatusListDataJson) => {
    const newOperationStatusList = [...get().operationStatus.operationStatusList];
    newOperationStatusList.length = rawData.offset + rawData.status_data.length;

    rawData.status_data.forEach((rawStatus, idx) => {
      const status: OperationStatus = {
        uuid: rawStatus.uuid,
        operationBranch: rawStatus.operation_branch,
        startTime: new Date(rawStatus.start_time),
        elapsedTime: typeof rawStatus.elapsed_time == 'number' ? rawStatus.elapsed_time : null,
        status: rawStatus.status,
        folder: rawStatus.folder,
      };
      newOperationStatusList[rawData.offset + idx] = status;
    });
    
    set(state => { 
      state.operationStatus.operationStatusList = newOperationStatusList; 
      state.operationStatus.numOperationStatus = rawData.num_status;
    }, false, 'getOperationStatusList');
  };

  return await fetchData<OperationStatusListDataJson>(
    `/api/get-operation-status-list?offset=${offset}&limit=${limit}`,
    {
      setFandE,
      setData,
    }
  );
};

const doToggleAutomaticRefresh = (get: GetFunction, set: SetFunction) => {
  const curRefresh = get().operationStatus.isAutomaticRefresh;
  set(state => { state.operationStatus.isAutomaticRefresh = !curRefresh }, false,
    "toggleAutomaticRefresh");
};

export const operationStatusSlice: StateCreator<
  DataStoreIf,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  OperationStatusIf
> = (set, get) => ({
  operationStatusList: [],
  numOperationStatus: 0,
  getOperationStatusListFetchAndError: {
    fetchStatus: FetchState.Idle,
    error: null,
    errorDetail: null,
  },
  isAutomaticRefresh: false,
  automaticRefreshTimer: -1,

  getOperationStatusList: async (offset: number, limit: number): Promise<FetchStatus> => 
    doGetOperationStatusList(offset, limit, get, set),
  toggleAutomaticRefresh: () => doToggleAutomaticRefresh(get, set),
  setAutomaticRefreshTimer: (timer: number) => set(store => { store.operationStatus.automaticRefreshTimer = timer }, false,
                                                  "setAutomaticRefreshTimer"),
});
