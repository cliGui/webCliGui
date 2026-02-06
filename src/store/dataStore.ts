import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import dataReplacer from '../utils/dataReplacer';
import fetchData, { FetchState, FetchStatus } from '../utils/fetchData';
import deepDiff from '../utils/deepDiff';
import {GetFunctionType, SetFunctionType} from './dataStoreTypes';
import { DataStoreIf } from './dataStoreIf';
import { TaskCreationSteps, TreeNode } from './createTaskIf';
import { OperationBase, Operation, OperationType, OperationFolder } from './operationTypes';
import { ParameterType, ParameterValue, ParameterBase, ParameterPreference, 
  ParameterStringValue, ParameterList, ParameterOptionsToList, ParameterData,
 } from './parameterTypes';

type GetFunction = GetFunctionType<DataStoreIf>;
type SetFunction = SetFunctionType<DataStoreIf>;

interface OperationBaseRaw {
  name: string;
}

interface OperationRaw extends OperationBaseRaw {
  operation_type: string;
  operation_module?: string;
}

interface OperationFolderRaw extends OperationBaseRaw {
  portfolio: (OperationRaw | OperationFolderRaw)[];
}

const loadOperationFolder = (folder: OperationFolderRaw): OperationFolder => {
  const operationFolder: OperationFolder = {
    name: folder.name,
    portfolio: [],
  };

  folder.portfolio.forEach((item) => {
    let portfolioItem: Operation | OperationFolder;
    if ('portfolio' in item) {
      portfolioItem = loadOperationFolder(item as OperationFolderRaw);
    } else {
      portfolioItem = {
        name: item.name,
        operationType: item.operation_type as OperationType,
        operationModule: item.operation_module,
      } as Operation;
    }
    operationFolder.portfolio.push(portfolioItem);
  });

  return operationFolder;
};

const loadTaskTree = (folder: OperationFolder, parentKey?: string): TreeNode => {
  const treeFolder: TreeNode = {
    key: `${parentKey ? parentKey + '-' : ''}${folder.name}`,
    title: folder.name,
  };
  if (folder.portfolio.length > 0) {
    treeFolder.children = [];
  }

  folder.portfolio.forEach((item) => {
    let childItem: TreeNode;

    if ('portfolio' in item) {
      childItem = loadTaskTree(item as OperationFolder, treeFolder.key);
    } else {
      childItem= {
        key: `${treeFolder.key}-${item.name}`,
        title: item.name,
      };
    }
    treeFolder.children!.push(childItem);
  });

  return treeFolder;
};

const doGetLibraryOperators = async (get: GetFunction, set: SetFunction) => {
  if (get().createTask.getLibraryOperatorsFetchAndError.fetchStatus !== FetchState.Idle) {
    return FetchState.Idle;
  }

  const setFetchStatus = (stat: FetchStatus) => 
    set(state => { state.createTask.getLibraryOperatorsFetchAndError.fetchStatus = stat; },
       false, 'getLibraryOperatorsFetchStatus');

  const setData = (data: OperationFolderRaw[]) => {
    const libraryFolders: OperationFolder[] = [];
    const taskTrees: TreeNode[] = [];
    data.forEach((folder) => {
      const operationFolder: OperationFolder = loadOperationFolder(folder);
      libraryFolders.push(operationFolder);

      const taskTree: TreeNode = loadTaskTree(operationFolder);
      taskTrees.push(taskTree);
    });

    set(state => { 
      state.createTask.libraryFolders = libraryFolders; 
      state.createTask.taskTrees = taskTrees;
    }, false, 'getLibraryOperators');
  };

  const setError = (err: string, errorDetail: string) => 
    set(state => { 
        state.createTask.getLibraryOperatorsFetchAndError.error = err; 
        state.createTask.getLibraryOperatorsFetchAndError.errorDetail = errorDetail;
      }, false, 'getLibraryOperatorsError');

  return await fetchData<OperationFolderRaw[]>(
    '/api/get-operation-hierarchy',
    {
      setFetchStatus,
      setData,
      setError,
    }
  );
};

const getOperationBranch = (operationPos: string, taskTrees: TreeNode[]): string[] | null => {
  const splitPosStr = operationPos.split('-');
  const splitPos = splitPosStr.map((val: string) => parseInt(val, 10));

  let items = taskTrees;
  const operationBranch: string[] = [];
  for (let idx = 1; idx < splitPos.length - 1; ++idx) {
    const item = items[splitPos[idx]];
    operationBranch.push(item.title);
    if (!item.children) throw new Error(`Expected folder at position ${splitPosStr.slice(0, idx + 1).join('-')}  but found operation.`);
    items = item.children!;
  }
  const item = items[splitPos[splitPos.length - 1]];
  if (item.children) // is a folder? Ignore
    return null;

  operationBranch.push(item.title);
  return operationBranch;
};

const getOperationFromBranch = (libraryFolders: OperationFolder[], operationBranch: string[]) => {
  const operation = operationBranch.reduce((prev: any, curr: string) => {
    if (!prev) {
      return libraryFolders.find(itm => itm.name === curr);
    }
    return prev.portfolio.find((itm: OperationBase) => itm.name === curr);
  }, null);

  return operation;
};

const doSetSelectedOperation = async (operationPos: string, get: GetFunction, set: SetFunction) => {
  const operationBranch = getOperationBranch(operationPos, get().createTask.taskTrees);
  if (!operationBranch) {
    return FetchState.Idle;
  }

  const orgOperationBranch = get().createTask.selectedOperationBranch;
  const diff = deepDiff(operationBranch, orgOperationBranch, true);
  if (typeof diff === 'undefined' && orgOperationBranch) {
    set(state => {
      state.createTask.selectedOperationBranch = null;
    }, false, 'setSelectedOperation');
    return FetchState.Idle;
  }
  
  const operation = getOperationFromBranch(get().createTask.libraryFolders, operationBranch);
  let fetchStatus: FetchStatus = FetchState.Idle;
  if (!operation.description) {
    fetchStatus = await doGetDescription(operationBranch, get, set);
    if (fetchStatus === FetchState.Error) return fetchStatus;
  }

  set(state => {
    state.createTask.selectedOperationBranch = operationBranch;
  }, false, 'setSelectedOperation');

  return fetchStatus;
};

const doGetDescription = async (operationBranch: string[], get: GetFunction, set: SetFunction) => {
  const setFetchStatus = (stat: FetchStatus) => 
    set(state => { state.createTask.getDescriptionFetchAndError.fetchStatus = stat; }, 
      false, 'getDescriptionFetchStatus');
  
  const setData = (data: string) => {
    console.log('data:', data);

    set(state => {
      const libraryFolders = state.createTask.libraryFolders;
      const operation = getOperationFromBranch(libraryFolders, operationBranch);
      operation.description = data;
    }, false, 'getDescription');
  };

  const setError = (err: string, errorDetail: string) => 
    set(state => { 
        state.createTask.getDescriptionFetchAndError.error = err; 
        state.createTask.getDescriptionFetchAndError.errorDetail = errorDetail;
      }, false, 'getDescriptionError');

  interface OperationBranch {
    operationBranch: string[];
  }

  return await fetchData<string, OperationBranch>(
    '/api/get-description',
    {
      postData: { operationBranch },
      setFetchStatus,
      setData,
      setError,
    }
  );
};

const doLoadParameters = async (get: GetFunction, set: SetFunction) => {
  if (get().createTask.loadParametersFetchAndError.fetchStatus === FetchState.Loading) {
    return FetchState.Loading;
  }

  const operationBranch = get().createTask.selectedOperationBranch!;

  const setFetchStatus = (stat: FetchStatus) => 
    set(state => { state.createTask.loadParametersFetchAndError.fetchStatus = stat; }, 
      false, 'loadParametersFetchStatus');
  
  const setData = (data: ParameterData) => {
    console.log('parameterData:', data);

    set(state => {
      const libraryFolders = state.createTask.libraryFolders;
      const operation = getOperationFromBranch(libraryFolders, operationBranch);
      operation.parameters = data;
    }, false, 'loadParameters');
  };

  const setError = (err: string, errorDetail: string) => 
    set(state => { 
        state.createTask.loadParametersFetchAndError.error = err; 
        state.createTask.loadParametersFetchAndError.errorDetail = errorDetail;
      }, false, 'loadParametersError');

  interface OperationBranch {
    operationBranch: string[];
  }

  return await fetchData<ParameterData, OperationBranch>(
    '/api/get-parameters',
    {
      postData: { operationBranch },
      setFetchStatus,
      setData,
      setError,
    }
  );
};

const doGetSelectedOperation = (get: GetFunction): Operation | null => {
  const operationBranch = get().createTask.selectedOperationBranch;
  if (!operationBranch) return null;

  const libraryFolders = get().createTask.libraryFolders;
  return getOperationFromBranch(libraryFolders, operationBranch);
};

const isParameterValid = (parameter: ParameterBase) => {
  if (!parameter.isSelected) return true;

  switch (parameter.type) {
    case ParameterType.PARAMETER_OPTIONS_TO_LIST: {
      const optionsToList = parameter as ParameterOptionsToList;
      if (optionsToList.selectedListIdx < 0) return false;
      const parameters = optionsToList.options[optionsToList.selectedListIdx];
      return isParameterValid(parameters);
    }

    case ParameterType.PARAMETER_LIST: {
      const parameterList = parameter as ParameterList;
      for (const param of parameterList.parameters) {
        if (!isParameterValid(param)) return false;
      }
      return true;
    }

    case ParameterType.STRING_VALUE: {
      const stringValue = parameter as ParameterStringValue;
      return stringValue.value.trim().length > 0;
    }

    case ParameterType.PREFERENCE: {
      return true;
    }

    default:
      console.error(`isParameterValid(): unknown parameterType '${parameter.type}'`);
      return false;
  }
};

const isParametersValid = (get: GetFunction) => {
  const {
    libraryFolders,
    selectedOperationBranch,
   } = get().createTask;
  const operation = getOperationFromBranch(libraryFolders, selectedOperationBranch as string[]);
  let parameters = operation.parameters;
  if (!parameters) return false;
  return isParameterValid(parameters);
};

const doIsNextStepValid = (get: GetFunction) => {
  const {
    taskCreationStep,
    selectedOperationBranch,
  } = get().createTask;

  switch (taskCreationStep) {
    case TaskCreationSteps.OperatorSelection:
      return !!selectedOperationBranch;

    case TaskCreationSteps.Parameters:
      return isParametersValid(get);

    case TaskCreationSteps.ServersSelection:
      return true;

    case TaskCreationSteps.Preview:
      return true;
  }

  return false;
};

const doSetNextTaskCreationStep = (nextStep: number, get: GetFunction, set: SetFunction) => {
  if (nextStep < 0 || TaskCreationSteps.Preview < nextStep) return;

  const { taskCreationStep } = get().createTask;
  set(state => {
    state.createTask.taskCreationStep = nextStep;
  }, false, 'setNextTaskCreationStep');
};

const doSetParameterValue = (parameterBranch: number[], value: ParameterValue, get: GetFunction, set: SetFunction) => {
  const operationBranch = get().createTask.selectedOperationBranch as string[];
  set(state => {
    const operation = getOperationFromBranch(state.createTask.libraryFolders, operationBranch);
    let parameter = operation.parameters;
    for (let idx = 0, valueUnused = true; valueUnused; ) {
      switch (parameter.type) {
        case ParameterType.PARAMETER_OPTIONS_TO_LIST: {
          const optionsToList = parameter as ParameterOptionsToList;
          if (idx === parameterBranch.length) {
            if (typeof value === 'boolean') {
              optionsToList.isSelected = value;
              if (!value) {
                if (optionsToList.selectedListIdx >= 0) {
                  optionsToList.options[optionsToList.selectedListIdx].isSelected = false;
                }
                optionsToList.selectedListIdx = -1;
              }
            } else {
              optionsToList.selectedListIdx = value as number;
              optionsToList.options[optionsToList.selectedListIdx].isSelected = true;
            }
            valueUnused = false;
          } else {
            parameter = optionsToList.options[optionsToList.selectedListIdx];
          }
          break;
        }

        case ParameterType.PARAMETER_LIST: {
          const paramList = parameter as ParameterList;
          if (idx === parameterBranch.length) {
            paramList.isSelected = value as boolean;
            valueUnused = false;
          } else {
            const paramIdx = parameterBranch[idx++];
            parameter = paramList.parameters[paramIdx];
          }
          break;
        }

        case ParameterType.STRING_VALUE: {
          const parameterStringValue = parameter as ParameterStringValue;
            if (typeof value === 'boolean') {
              parameterStringValue.isSelected = value;
            } else {
            parameterStringValue.value = value as string;
          }
          valueUnused = false;
          break;
        }

        case ParameterType.PREFERENCE: {
          const parameterPreference = parameter as ParameterPreference;
          parameterPreference.isSelected = value as boolean;
          valueUnused = false;
          break;
        }

        default:
          console.error(`doSetParameterValue(), unknown parameter type '${parameter.type}'`);
          valueUnused = false;
          break;
      }
    }
  }, false, 'setParameterValue');
};

export const useDataStore = create<DataStoreIf>()(
  devtools(immer((set, get) => ({
    createTask: {
      libraryFolders: [],
      taskTrees: [],
      taskCreationStep: TaskCreationSteps.OperatorSelection,
      selectedOperationBranch: null,
      getLibraryOperatorsFetchAndError: {
        fetchStatus: FetchState.Idle,
        error: null,
        errorDetail: null,
      },
      getDescriptionFetchAndError: {
        fetchStatus: FetchState.Idle,
        error: null,
        errorDetail: null,
      },
      loadParametersFetchAndError: {
        fetchStatus: FetchState.Idle,
        error: null,
        errorDetail: null,
      },

      getLibraryOperators: async () => await doGetLibraryOperators(get, set),
      setSelectedOperation: async (operationPos: string) => await doSetSelectedOperation(operationPos, get, set),
      getSelectedOperation: () => doGetSelectedOperation(get),
      isNextStepValid: () => doIsNextStepValid(get),
      setNextTaskCreationStep: (nextStep: number) => doSetNextTaskCreationStep(nextStep, get, set),
      loadParameters: async () => await doLoadParameters(get, set),
      setParameterValue: (parameterBranch: number[], value: ParameterValue) => doSetParameterValue(parameterBranch, value, get, set),
    }
  })), { 
    name: 'DataStore',
        serialize: {
      options: true,
      replacer: dataReplacer,
    },
  })
);
