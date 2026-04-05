import { CreateTaskIf } from "./createTaskIf";
import { OperationStatusIf } from "./operationStatusIf";

export interface DataStoreIf {
  createTask: CreateTaskIf;
  operationStatus: OperationStatusIf;
}
