

interface OperationBaseJson {
  name: string;
}

interface OperationJson extends OperationBaseJson {
  operation_type: string;
  operation_module?: string;
}

interface OperationFolderJson extends OperationBaseJson {
  portfolio: (OperationJson | OperationFolderJson)[];
}

interface OperationStatusJson {
  uuid: string,
  operation_branch: string[],
  start_time: string,
  elapsed_time: number | null,
  status: string,
  folder: string,
}
