import { FetchStatus, FetchAndError } from "../utils/fetchData";
import { Operation, OperationFolder, OperationType } from "./operationTypes";
import { ParameterValue } from "./parameterTypes";

export interface TreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
}

export enum TaskCreationSteps {
  OperatorSelection,
  Parameters,
  ServersSelection,
  Preview,
}

export const WEB_CLI_GUI_SERVER = 'WebCliGui Server';

export interface CreateTaskIf {
  libraryFolders: OperationFolder[];
  filteredLibraryFolders: OperationFolder[]; 
  taskTrees: TreeNode[];
  taskCreationStep: TaskCreationSteps;
  selectedOperationType: OperationType;
  selectedOperationBranch: string[] | null;
  getLibraryOperatorsFetchAndError: FetchAndError;
  getDescriptionFetchAndError: FetchAndError;
  loadParametersFetchAndError: FetchAndError;
  submitOperationFetchAndError: FetchAndError;

  getLibraryOperators: () => Promise<FetchStatus>;
  setSelectedOperationType: (operationType: OperationType) => void;
  setSelectedOperation: (operationPos: string) => Promise<FetchStatus>;
  getSelectedOperation: () => Operation | null;
  isNextStepValid: () => boolean;
  setNextTaskCreationStep: (nextStep: number) => void;
  loadParameters: () => Promise<FetchStatus>;
  setParameterValue: (parameterBranch: number[], value: ParameterValue) => void;
  getExecuteCommand: () => string[] | null;
  submitOperation: () => void;
}
