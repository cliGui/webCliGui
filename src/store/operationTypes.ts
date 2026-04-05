import { ParameterData } from './parameterTypes';

export enum OperationType {
  Module = "module",
  Pipx = "pipx",
}

export enum OperationState {
  STARTED = "*****Neda Started*****",
  FINISHED = "*****Neda Finished*****",
}

export interface OperationBase {
  name: string;
}

export interface Operation extends OperationBase {
  operationType: OperationType;
  operationModule?: string;
  description?: string;
  parameters?: ParameterData;
}

export interface OperationFolder extends OperationBase {
  portfolio: (Operation | OperationFolder)[];
}

export interface OperationStatus {
  uuid: string,
  operationBranch: string[],
  startTime: Date,
  elapsedTime: number | null,
  status: string,
  folder: string,
}
