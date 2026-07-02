import { WritableDraft } from 'immer';
import { DataStoreIf } from './dataStoreIf';

type NextStateOrUpdater<T> = T | Partial<T> | ((state: WritableDraft<T>) => void);

export type GetFunctionType<T> = () => T;
export type SetFunctionType<T> = (nextStateOrUpdater: NextStateOrUpdater<T>,
                                  shouldReplace: false, 
                                  action: string) => void;

// Define types for this dataStore 
export type GetFunction = GetFunctionType<DataStoreIf>;
export type SetFunction = SetFunctionType<DataStoreIf>;
