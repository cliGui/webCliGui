import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import dataReplacer from '@utils/dataReplacer';
import { DataStoreIf } from './dataStoreIf';
import { authenticationSlice } from './authentication/authenticationSlice';
import { createTaskSlice } from './createTask/createTaskSlice';
import { operationStatusSlice } from './operationStatus/operationStatusSlice';

export const useDataStore = create<DataStoreIf>()(
  devtools(immer((...args) => ({
      authentication: authenticationSlice(...args),
      createTask: createTaskSlice(...args),
      operationStatus: operationStatusSlice(...args),
    })), { 
    name: 'DataStore',
    serialize: {
      options: true,
      replacer: dataReplacer,
    },
  })
);
