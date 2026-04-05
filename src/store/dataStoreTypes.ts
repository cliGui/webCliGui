import { WritableDraft } from 'immer';
import { DataStoreIf } from './dataStoreIf';

export type GetFunctionType<T> = () => T;
export type SetFunctionType<T> = (nextStateOrUpdater: T | Partial<T> | ((state: WritableDraft<T>) => void),
                    shouldReplace: false, action: string) => void;

export type GetFunction = GetFunctionType<DataStoreIf>;
export type SetFunction = SetFunctionType<DataStoreIf>;
