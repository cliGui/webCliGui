

export interface OperationBaseJson {
  name: string;
}

export interface OperationJson extends OperationBaseJson {
  operation_type: string;
  operation_module?: string;
}

export interface OperationFolderJson extends OperationBaseJson {
  portfolio: (OperationJson | OperationFolderJson)[];
}

export interface OperationBranchJson {
  operationBranch: string[];
}

export interface OperationStatusJson {
  uuid: string,
  operation_branch: string[],
  start_time: string,
  elapsed_time: number | null,
  status: string,
  folder: string,
}

export interface OperationStatusListDataJson {
  total_num_status: number,
  offset: number,
  status_data: OperationStatusJson[],
}

export interface SubmitOperationJson {
  operation_branch: string[];
  command: string[];
  servers: string[];
}
