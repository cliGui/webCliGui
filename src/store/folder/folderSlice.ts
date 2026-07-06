import { StateCreator } from 'zustand';
import { GetFunction, SetFunction } from '../dataStoreTypes';
import { FolderIf } from './folderIf';
import { DataStoreIf } from '../dataStoreIf';
import { Screen } from '../screen/screenSelectionIf';
import fetchData, { FetchState, FetchStatus, handleFetchStatusAndError, initFetchStatusAndError } from '@store/fetchData';

interface FolderAccessDataJson {
  type: 'file' | 'directory';
  path?: string;
  file_list?: string[];
  content?: string;
}

const doOpenFolder = async (path: string, get: GetFunction, set: SetFunction): Promise<FetchStatus> => {
  get().screenSelection.setScreen(Screen.FOLDER);

  const handleFandE = handleFetchStatusAndError(get, set, ['folder', 'getFolderDataFetchAndError']);

  const setData = (rawData: FolderAccessDataJson) => {
    set(state => {
      state.folder.folderData = {
        path: rawData.path ?? path,
        fileList: rawData.file_list ?? [],
      };
    }, false, 'openFolder');
  };

  const accessToken = get().authentication.accessToken;

  return await fetchData<FolderAccessDataJson>(
    `/api/folder-access/${path}`,
    { accessToken, handleFandE, setData }
  );
};

const doOpenFile = async (name: string, get: GetFunction, set: SetFunction): Promise<FetchStatus> => {
  const folderPath = get().folder.folderData?.path;
  const filePath = `${folderPath}/${name}`;

  const handleFandE = handleFetchStatusAndError(get, set, ['folder', 'getFolderDataFetchAndError']);

  const setData = (rawData: FolderAccessDataJson) => {
    set(state => {
      state.folder.fileData = {
        path: filePath,
        content: rawData.content ?? '',
      };
    }, false, 'openFile');
  };

  const accessToken = get().authentication.accessToken;

  return await fetchData<FolderAccessDataJson>(
    `/api/folder-access/${filePath}`,
    { accessToken, handleFandE, setData }
  );
};

const doCloseFile = (set: SetFunction) => {
  set(state => { state.folder.fileData = null; }, false, 'closeFile');
};

const doCloseFolder = (get: GetFunction, set: SetFunction) => {
  get().screenSelection.setScreen(Screen.TABS);
  set(state => {
    state.folder.folderData = null;
    state.folder.fileData = null;
  }, false, 'closeFolder');
};

const doFolderReset = async (get: GetFunction, set: SetFunction) => {
  await get().folder.getFolderDataFetchAndError.abort();

  set(state => {
    state.folder.folderData = null;
    state.folder.fileData = null;
    state.folder.getFolderDataFetchAndError = initFetchStatusAndError('openFolder');
  }, false, 'folderReset');
};

export const folderSlice: StateCreator<
  DataStoreIf,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  FolderIf
> = (set, get) => ({
  folderData: null,
  fileData: null,
  getFolderDataFetchAndError: initFetchStatusAndError('openFolder'),

  openFolder: (path: string) => doOpenFolder(path, get, set),
  openFile: (name: string) => doOpenFile(name, get, set),
  closeFile: () => doCloseFile(set),
  closeFolder: () => doCloseFolder(get, set),
  folderReset: () => doFolderReset(get, set),
});
