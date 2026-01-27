import { WritableDraft } from 'immer';

export type GetFunctionType<T> = () => T;
export type SetFunctionType<T> = (nextStateOrUpdater: T | Partial<T> | ((state: WritableDraft<T>) => void),
                    shouldReplace: false, action: string) => void;
