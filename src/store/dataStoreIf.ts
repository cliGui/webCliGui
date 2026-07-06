import { AuthenticationIf } from "./authentication/authenticationIf";
import { ScreenSelectionIf } from "./screen/screenSelectionIf";
import { CreateTaskIf } from "./createTask/createTaskIf";
import { OperationStatusIf } from "./operationStatus/operationStatusIf";
import { FolderIf } from "./folder/folderIf";

export interface DataStoreIf {
  authentication: AuthenticationIf;
  screenSelection: ScreenSelectionIf;
  createTask: CreateTaskIf;
  operationStatus: OperationStatusIf;
  folder: FolderIf;
}
