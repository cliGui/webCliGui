import { StateCreator  } from 'zustand';
import { GetFunction, SetFunction } from '../dataStoreTypes';
import { OperationStatusIf } from './operationStatusIf';
import { DataStoreIf } from '../dataStoreIf';
import { OperationStatus } from '../types/operationTypes';
import { OperationStatusListDataJson } from '../types/operationTypesJson';
import fetchData, { FetchStatus, handleFetchStatusAndError, initFetchStatusAndError } from '@store/fetchData';

const doGetOperationStatusList = async (offset: number, limit: number, reload: boolean | undefined, get: GetFunction, set: SetFunction): Promise<FetchStatus> => {
  const handleFandE = handleFetchStatusAndError(get, set, ['operationStatus', 'getOperationStatusListFetchAndError'], 'getOperationStatusList');

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
      state.operationStatus.totalNumOperationStatus = rawData.total_num_status;
    }, false, 'getOperationStatusList');
  };

  const accessToken = get().authentication.accessToken;

  return await fetchData<OperationStatusListDataJson>(
    `/api/get-operation-status-list?offset=${offset}&limit=${limit}`,
    {
      accessToken,
      handleFandE,
      setData,
      reload: true,
    }
  );
};

const doToggleAutomaticRefresh = (get: GetFunction, set: SetFunction) => {
  const curRefresh = get().operationStatus.isAutomaticRefresh;
  set(state => { state.operationStatus.isAutomaticRefresh = !curRefresh }, false,
    "toggleAutomaticRefresh");
};

const doOperationStatusReset = async (get: GetFunction, set: SetFunction) => {
  await get().operationStatus.getOperationStatusListFetchAndError.abort();

  set(state => {
    state.operationStatus.operationStatusList = [];
    state.operationStatus.totalNumOperationStatus = 0;
    state.operationStatus.getOperationStatusListFetchAndError = initFetchStatusAndError();
    state.operationStatus.isAutomaticRefresh = false;
  }, false, 'operationStatusReset');
}

export const operationStatusSlice: StateCreator<
  DataStoreIf,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  OperationStatusIf
> = (set, get) => ({
  operationStatusList: [],
  totalNumOperationStatus: 0,
  getOperationStatusListFetchAndError: initFetchStatusAndError(),
  isAutomaticRefresh: false,
  automaticRefreshTimer: -1,

  getOperationStatusList: async (offset: number, limit: number, reload?: boolean): Promise<FetchStatus> => 
    doGetOperationStatusList(offset, limit, reload, get, set),
  toggleAutomaticRefresh: () => doToggleAutomaticRefresh(get, set),
  setAutomaticRefreshTimer: (timer: number) => set(state => { state.operationStatus.automaticRefreshTimer = timer }, false,
                                                  "setAutomaticRefreshTimer"),
  operationStatusReset: () => doOperationStatusReset(get, set),
});
