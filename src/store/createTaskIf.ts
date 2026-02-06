import { FetchStatus, FetchAndError } from "../utils/fetchData";
import { Operation, OperationFolder } from "./operationTypes";
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

export interface CreateTaskIf {
  libraryFolders: OperationFolder[];
  taskTrees: TreeNode[];
  taskCreationStep: TaskCreationSteps;
  selectedOperationBranch: string[] | null;
  getLibraryOperatorsFetchAndError: FetchAndError;
  getDescriptionFetchAndError: FetchAndError;
  loadParametersFetchAndError: FetchAndError;

  getLibraryOperators: () => Promise<FetchStatus>;
  setSelectedOperation: (operationPos: string) => Promise<FetchStatus>;
  getSelectedOperation: () => Operation | null;
  isNextStepValid: () => boolean;
  setNextTaskCreationStep: (nextStep: number) => void;
  loadParameters: () => Promise<FetchStatus>;
  setParameterValue: (parameterBranch: number[], value: ParameterValue) => void;
}
