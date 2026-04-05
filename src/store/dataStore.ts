import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import dataReplacer from '../utils/dataReplacer';
import { DataStoreIf } from './dataStoreIf';
import { createTaskSlice } from './createTaskSlice';
import { operationStatusSlice } from './operationStatusSlice';

export const useDataStore = create<DataStoreIf>()(
  devtools(immer((...args) => ({
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
