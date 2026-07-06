import { FetchStatus, FetchStatusAndError } from "@store/fetchData";

export interface FolderData {
  path: string;
  fileList: string[];
}

export interface FileData {
  path: string;
  content: string;
}

export interface FolderIf {
  folderData: FolderData | null;
  fileData: FileData | null;
  getFolderDataFetchAndError: FetchStatusAndError;

  openFolder: (path: string) => Promise<FetchStatus>;
  openFile: (name: string) => Promise<FetchStatus>;
  closeFile: () => void;
  closeFolder: () => void;
  folderReset: () => void;
}
