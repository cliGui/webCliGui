import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import dataReplacer from '@utils/dataReplacer';
import { DataStoreIf } from './dataStoreIf';
import { authenticationSlice } from './authentication/authenticationSlice';
import { screenSelectionSlice } from './screen/screenSelectionSlice';
import { createTaskSlice } from './createTask/createTaskSlice';
import { operationStatusSlice } from './operationStatus/operationStatusSlice';
import { folderSlice } from './folder/folderSlice';

export const useDataStore = create<DataStoreIf>()(
  devtools(immer((...args) => ({
      authentication: authenticationSlice(...args),
      screenSelection: screenSelectionSlice(...args),
      createTask: createTaskSlice(...args),
      operationStatus: operationStatusSlice(...args),
      folder: folderSlice(...args),
    })), {
    name: 'DataStore',
    serialize: {
      options: true,
      replacer: dataReplacer,
    },
  })
);
