import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { WritableDraft } from 'immer';
import dataReplacer from './utils/dataReplacer';
import fetchData, { FetchState, FetchStatus } from './utils/fetchData';

export type GetFunctionType<T> = () => T;
export type SetFunctionType<T> = (nextStateOrUpdater: T | Partial<T> | ((state: WritableDraft<T>) => void),
                    shouldReplace: false, action: string) => void;

type GetFunction = GetFunctionType<DataStore>;
type SetFunction = SetFunctionType<DataStore>;

enum OperationType {
  Module = "module",
  Pipx = "pipx",
}

export interface Operation {
  operationType: OperationType;
  operationName: string;
  operationModule?: string;
}

export interface OperationFolder {
  folderName: string;
  portfolio: (Operation | OperationFolder)[];
}

export interface TreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
}

export interface CreateTask {
  libraryFolders: OperationFolder[];
  taskTrees: TreeNode[];
  getLibraryOperatorsFetchStatus: FetchStatus;
  getLibraryOperatorsError: string | null;
  getLibraryOperatorsErrorDetail: string | null;

  getLibraryOperators: () => Promise<FetchStatus>;
}

export interface DataStore {
  createTask: CreateTask;
};


interface OperationRaw {
  operation_type: OperationType;
  operation_name: string;
  operation_module?: string;
}

interface OperationFolderRaw {
  folder_name: string;
  portfolio: (OperationRaw | OperationFolderRaw)[];
}

const loadOperationFolder = (folder: OperationFolderRaw): OperationFolder => {
  const operationFolder: OperationFolder = {
    folderName: folder.folder_name,
    portfolio: [],
  };

  folder.portfolio.forEach((item) => {
    let portfolioItem: Operation | OperationFolder;
    if ('portfolio' in item) {
      portfolioItem = loadOperationFolder(item as OperationFolderRaw);
    } else {
      portfolioItem = {
        operationType: item.operation_type,
        operationName: item.operation_name,
        operationModule: item.operation_module,
      } as Operation;
    }
    operationFolder.portfolio.push(portfolioItem);
  });

  return operationFolder;
};

const loadTaskTree = (folder: OperationFolder, parentKey?: string): TreeNode => {
  const treeFolder: TreeNode = {
    key: `${parentKey ? parentKey + '-' : ''}${folder.folderName}`,
    title: folder.folderName,
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
        key: `${treeFolder.key}-${item.operationName}`,
        title: item.operationName,
      };
    }
    treeFolder.children!.push(childItem);
  });

  return treeFolder;
};

const doGetLibraryOperators = async (set: SetFunction) => {
  const setFetchStatus = (stat: FetchStatus) => 
    set(state => { state.createTask.getLibraryOperatorsFetchStatus = stat; }, false, 'getLibraryOperatorsFetchStatus');

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
        state.createTask.getLibraryOperatorsError = err; 
        state.createTask.getLibraryOperatorsErrorDetail = errorDetail;
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

export const useDataStore = create<DataStore>()(
  devtools(immer((set, get) => ({
    createTask: {
      libraryFolders: [],
      taskTrees: [],
      getLibraryOperatorsFetchStatus: FetchState.Idle,
      getLibraryOperatorsError: null,
      getLibraryOperatorsErrorDetail: null,

      getLibraryOperators: async () => await doGetLibraryOperators(set),
    }
  })), { 
    name: 'DataStore',
        serialize: {
      options: true,
      replacer: dataReplacer,
    },
  })
);
