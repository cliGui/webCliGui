import { ParameterData } from './parameterTypes';

export enum OperationType {
  Module = "module",
  Pipx = "pipx",
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
