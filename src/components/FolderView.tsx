import React from 'react';
import { useDataStore } from '@store/dataStore';
import WaitAndError from './regalia/WaitAndError';
import Button from './regalia/Button';

const FolderView = () => {
  const {
    folderData,
    fileData,
    getFolderDataFetchAndError,
    openFile,
    closeFile,
    closeFolder,
  } = useDataStore(state => state.folder);

  const onBack = () => {
    if (fileData) {
      closeFile();
    } else {
      closeFolder();
    }
  };

  const onOpenFile = (evt: React.MouseEvent<HTMLAnchorElement>, name: string) => {
    evt.preventDefault();
    openFile(name);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex">
        <Button onClick={onBack}>Back</Button>
        <WaitAndError fetchAndError={getFolderDataFetchAndError} />
      </div>

      {fileData && (
        <>
          <span className="italic font-bold pl-1">{fileData.path}</span>

          <pre className="whitespace-pre-wrap break-all pl-1">{fileData.content}</pre>
        </>
      )}

      {!fileData && folderData && (
        <>
          <span className="italic font-bold pl-1">{folderData.path}</span>

          <ul className="flex flex-col pl-1! gap-1">
            {folderData.fileList.map(name => (
              <li key={name}>
                <a href="#" onClick={evt => onOpenFile(evt, name)}>
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </>
        )}
    </div>
  );
};

export default FolderView;
