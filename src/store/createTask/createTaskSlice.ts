import { StateCreator  } from 'zustand';
import { GetFunction, SetFunction } from '../dataStoreTypes';
import { CreateTaskIf } from "./createTaskIf";
import { DataStoreIf } from '../dataStoreIf';
import fetchData, { FetchState, FetchStatus, FetchStatusAndError, handleFetchStatusAndError, initFetchStatusAndError } from '@utils/fetchData';
import deepDiff from '@utils/deepDiff';
import { TaskCreationSteps, TreeNode, WEB_CLI_GUI_SERVER } from './createTaskIf';
import { OperationBase, Operation, OperationType, OperationFolder, OperationStatus } from '../types/operationTypes';
import { OperationBranchJson, OperationFolderJson, OperationStatusJson, SubmitOperationJson } from '../types/operationTypesJson';
import { ParameterType, ParameterValue, ParameterBase, ParameterPreference,
  ParameterStringValue, ParameterList, ParameterOptionsToList, ParameterData,
 } from '../types/parameterTypes';

const loadOperationFolder = (folder: OperationFolderJson): OperationFolder => {
  const operationFolder: OperationFolder = {
    name: folder.name,
    portfolio: [],
  };

  folder.portfolio.forEach((item) => {
    let portfolioItem: Operation | OperationFolder;
    if ('portfolio' in item) {
      portfolioItem = loadOperationFolder(item as OperationFolderJson);
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

const filterLibraryFolder = (folder: OperationFolder, operationType: OperationType): OperationFolder | null => {
  const filteredFolder: OperationFolder = {
    name: folder.name,
    portfolio: [],
  };

  folder.portfolio.forEach(item => {
    if ('portfolio' in item) {
      const subFolder = filterLibraryFolder(item as OperationFolder, operationType);
      if (subFolder) {
        filteredFolder.portfolio.push(subFolder);
      }
    } else {
      const operation = item as Operation;
      if (operation.operationType === operationType) {
        filteredFolder.portfolio.push(operation);
      }
    }
  });

  if (filteredFolder.portfolio.length === 0) {
    return null;
  }

  return filteredFolder;
}

const getFilterLibraryFolders = (get: GetFunction, set: SetFunction) => {
  const libraryFolders = get().createTask.libraryFolders;
  const operationType = get().createTask.selectedOperationType;
  const filteredLibraryFolders: OperationFolder[] = [];
  const taskTrees: TreeNode[] = [];

  libraryFolders.forEach(folder => {
    const filteredFolder = filterLibraryFolder(folder, operationType);
    if (!filteredFolder) return;

    filteredLibraryFolders.push(filteredFolder);
    const taskTree: TreeNode = loadTaskTree(filteredFolder);
    taskTrees.push(taskTree);
  });

  set(state => { 
    state.createTask.filteredLibraryFolders = filteredLibraryFolders;
    state.createTask.taskTrees = taskTrees; 
  }, false, 'getFilteredLibraryOperators');
}

const doGetLibraryOperators = async (get: GetFunction, set: SetFunction) => {
  const handleFandE = handleFetchStatusAndError(
    () => get().createTask.getLibraryOperatorsFetchAndError,
    (fandE: FetchStatusAndError, fAndEText: string) =>
      set(state => { state.createTask.getLibraryOperatorsFetchAndError = fandE }, false, 
        `getLibraryOperators_${fAndEText}`)
  );

  const setData = (data: OperationFolderJson[]) => {
    const libraryFolders: OperationFolder[] = [];
    data.forEach((folder) => {
      const operationFolder: OperationFolder = loadOperationFolder(folder);
      libraryFolders.push(operationFolder);
    });

    set(state => { 
      state.createTask.libraryFolders = libraryFolders; 
    }, false, 'getLibraryOperators');

    getFilterLibraryFolders(get, set);
  };

  const accessToken = get().authentication.accessToken;

  return await fetchData<OperationFolderJson[]>(
    '/api/get-operation-hierarchy',
    {
      accessToken,
      handleFandE,
      setData,
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

const doSetSelectedOperationType = (operationType: OperationType, get: GetFunction, set: SetFunction) => {
  set(state => {
    state.createTask.selectedOperationType = operationType;
    state.createTask.selectedOperationBranch = null;
  }, false, "setSelectedOperationType");

  getFilterLibraryFolders(get, set);
};

const sendMessagesToParent = (operationBranch: string[]) => {
  window.parent.postMessage({
    type: 'csPlayer:packageChanged',
    data: { packageName: operationBranch[0] },
  }, '*');

  const operation = operationBranch.reduce<string>((prevValue, curValue) => curValue, '');
  window.parent.postMessage({
    type: 'csPlayer:filterChanged',
    data: { csxuName: operation },
  }, '*');
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

  sendMessagesToParent(operationBranch);

  return fetchStatus;
};

const doGetDescription = async (operationBranch: string[], get: GetFunction, set: SetFunction) => {
  const handleFandE = handleFetchStatusAndError(
    () => get().createTask.getDescriptionFetchAndError,
    (fandE: FetchStatusAndError, fAndEText: string) =>
      set(state => { state.createTask.getDescriptionFetchAndError = fandE }, false, 
        `getDescription_${fAndEText}`)
  );
  
  const setData = (data: string) => {
    set(state => {
      const libraryFolders = state.createTask.libraryFolders;
      const operation = getOperationFromBranch(libraryFolders, operationBranch);
      operation.description = data;
    }, false, 'getDescription');
  };

  const postData: OperationBranchJson = { operationBranch };

  const accessToken = get().authentication.accessToken;

  return await fetchData<string, OperationBranchJson>(
    '/api/get-description',
    {
      accessToken,
      handleFandE,
      postData,
      setData,
      reload: true,
    }
  );
};

const doLoadParameters = async (get: GetFunction, set: SetFunction) => {
  const handleFandE = handleFetchStatusAndError(
    () => get().createTask.loadParametersFetchAndError,
    (fandE: FetchStatusAndError, fAndEText: string) =>
      set(state => { state.createTask.loadParametersFetchAndError = fandE }, false, 
        `loadParameters_${fAndEText}`)
  );

  const operationBranch = get().createTask.selectedOperationBranch!;
  const postData: OperationBranchJson = { operationBranch };
  
  const setData = (data: ParameterData) => {
    set(state => {
      const libraryFolders = state.createTask.libraryFolders;
      const operation = getOperationFromBranch(libraryFolders, operationBranch);
      operation.parameters = data;
    }, false, 'loadParameters');
  };

  const accessToken = get().authentication.accessToken;

  return await fetchData<ParameterData, OperationBranchJson>(
    '/api/get-parameters',
    {
      accessToken,
      handleFandE,
      postData,
      setData,
      reload: true,
    }
  );
};

const doGetSelectedOperation = (get: GetFunction): Operation | null => {
  const operationBranch = get().createTask.selectedOperationBranch;
  if (!operationBranch) return null;

  const libraryFolders = get().createTask.libraryFolders;
  return getOperationFromBranch(libraryFolders, operationBranch);
};

const getParameterArray = (parameter: ParameterBase): string[] | null => {
  if (!parameter.isSelected) return [];

  switch (parameter.type) {
    case ParameterType.PARAMETER_OPTIONS_TO_LIST: {
      const optionsToList = parameter as ParameterOptionsToList;
      if (optionsToList.selectedListIdx < 0) return null;
      const parameters = optionsToList.options[optionsToList.selectedListIdx];
      const params = getParameterArray(parameters);
      if (params === null) return null;
      return [parameter.name, parameters.name, ...params];
    }

    case ParameterType.PARAMETER_LIST: {
      const parameterList = parameter as ParameterList;
      let params: string[] = [];
      for (const param of parameterList.parameters) {
        const paramArr = getParameterArray(param);
        if (paramArr === null) return null;
        params = params.concat(paramArr);
      }
      return params;
    }

    case ParameterType.STRING_VALUE: {
      const stringParam = parameter as ParameterStringValue;
      const stringValue = stringParam.value.trim();
      if (stringValue.length === 0) return null;
      return stringParam.name.length > 0 ? [stringParam.name, stringValue] : [stringValue];
    }

    case ParameterType.PREFERENCE: {
      return [parameter.name];
    }

    default:
      console.error(`getParameter(): unknown parameterType '${parameter.type}'`);
      return null;
  }
};

const getParameters = (get: GetFunction): string[] | null => {
  const {
    libraryFolders,
    selectedOperationBranch,
   } = get().createTask;
  const operation = getOperationFromBranch(libraryFolders, selectedOperationBranch as string[]);
  let parameters = operation.parameters;
  if (!parameters) return null;
  return getParameterArray(parameters);
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
      return getParameters(get) !== null;

    case TaskCreationSteps.ServersSelection:
      return true;

    case TaskCreationSteps.Preview:
      return get().createTask.submitOperationFetchAndError.fetchStatus !== FetchState.Loading;
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

const doGetExecuteCommand = (get: GetFunction) => {
  const operation = doGetSelectedOperation(get);
  if (!operation) return null;
  const params = getParameters(get);
  if (params === null) return null;
  return [operation.name, ...params];
}

const doSubmitOperation = async (get: GetFunction, set: SetFunction) => {
  set(state => { state.createTask.operationStatus = null }, false, 'submitOperation_Init');

  const handleFandE = handleFetchStatusAndError(
    () => get().createTask.submitOperationFetchAndError,
    (fandE: FetchStatusAndError, fAndEText: string) =>
      set(state => { state.createTask.submitOperationFetchAndError = fandE }, false, 
        `submitOperation_${fAndEText}`)
  );

  const operationBranch = get().createTask.selectedOperationBranch as string[];
  const cmd = doGetExecuteCommand(get) as string[];

  const postData: SubmitOperationJson = 
    { operation_branch: operationBranch, command: cmd, servers: [WEB_CLI_GUI_SERVER] };

  const setData = (data: OperationStatusJson) => {
    const operationStatus: OperationStatus = {
      uuid: data.uuid,
      operationBranch: data.operation_branch,
      startTime: new Date(data.start_time),
      elapsedTime: data.elapsed_time ? data.elapsed_time : null,
      status: data.status,
      folder: data.folder,
    }

    set(state => { state.createTask.operationStatus = operationStatus }, false, 'submitOperation');
  };
  
  const accessToken = get().authentication.accessToken;

  return await fetchData<OperationStatusJson, SubmitOperationJson>(
    '/api/submit-operation',
    {
      accessToken,
      handleFandE,
      postData,
      setData,
      reload: true,
    }
  );
}

const doCreateTaskReset = async (get: GetFunction, set: SetFunction) => {
  const createTask = get().createTask;
  await Promise.all([
    createTask.getLibraryOperatorsFetchAndError.abort(),
    createTask.getDescriptionFetchAndError.abort(),
    createTask.loadParametersFetchAndError.abort(),
    createTask.submitOperationFetchAndError.abort(),
  ]);

  set(state => {
    state.createTask.libraryFolders = [];
    state.createTask.filteredLibraryFolders = [];
    state.createTask.taskTrees = [];
    state.createTask.taskCreationStep = TaskCreationSteps.OperatorSelection;
    state.createTask.selectedOperationType = OperationType.Pipx;
    state.createTask.selectedOperationBranch = null;
    state.createTask.operationStatus = null;
    state.createTask.getLibraryOperatorsFetchAndError = initFetchStatusAndError();
    state.createTask.getDescriptionFetchAndError = initFetchStatusAndError();
    state.createTask.loadParametersFetchAndError = initFetchStatusAndError();
    state.createTask.submitOperationFetchAndError = initFetchStatusAndError();
  }, false, 'createTaskReset');
};

export const createTaskSlice: StateCreator<
  DataStoreIf,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  CreateTaskIf
> = (set, get) => ({
  libraryFolders: [],
  filteredLibraryFolders: [],
  taskTrees: [],
  taskCreationStep: TaskCreationSteps.OperatorSelection,
  selectedOperationType: OperationType.Pipx,
  selectedOperationBranch: null,
  operationStatus: null,
  getLibraryOperatorsFetchAndError: initFetchStatusAndError(),
  getDescriptionFetchAndError: initFetchStatusAndError(),
  loadParametersFetchAndError: initFetchStatusAndError(),
  submitOperationFetchAndError: initFetchStatusAndError(),

  getLibraryOperators: async () => await doGetLibraryOperators(get, set),
  setSelectedOperationType: (operationType: OperationType) => doSetSelectedOperationType(operationType, get, set),
  setSelectedOperation: async (operationPos: string) => await doSetSelectedOperation(operationPos, get, set),
  getSelectedOperation: () => doGetSelectedOperation(get),
  isNextStepValid: () => doIsNextStepValid(get),
  setNextTaskCreationStep: (nextStep: number) => doSetNextTaskCreationStep(nextStep, get, set),
  loadParameters: async () => await doLoadParameters(get, set),
  setParameterValue: (parameterBranch: number[], value: ParameterValue) => doSetParameterValue(parameterBranch, value, get, set),
  getExecuteCommand: () => doGetExecuteCommand(get),
  submitOperation: () => doSubmitOperation(get, set),
  createTaskReset: () => doCreateTaskReset(get, set),
});
