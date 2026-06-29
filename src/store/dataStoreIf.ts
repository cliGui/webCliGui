import { AuthenticationIf } from "./authentication/authenticationIf";
import { CreateTaskIf } from "./createTask/createTaskIf";
import { OperationStatusIf } from "./operationStatus/operationStatusIf";

export interface DataStoreIf {
  authentication: AuthenticationIf;
  createTask: CreateTaskIf;
  operationStatus: OperationStatusIf;
}
