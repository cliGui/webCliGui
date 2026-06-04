import React from "react";
import { useDataStore } from "@store/dataStore";
import WaitAndError from "../regalia/WaitAndError";

interface PreviewProps {
  isVisible: boolean;
}

const Preview = ({
  isVisible,
}: PreviewProps) => {
  const {
    getExecuteCommand,
    submitOperationFetchAndError,
    operationStatus,
  } = useDataStore(store => store.createTask);

  const execCmd = getExecuteCommand();

  return (
    <div className={`flex flex-row ${!isVisible && 'invisible w-0 h-0'}`}>
      <div className="flex flex-col w-[500px]">
        <h6>Command:</h6>
        {!execCmd && <span>No command?!?!</span>}
        {execCmd && <span>{execCmd.join(' ')}</span>}

        <h6 className="!mt-7">Server(s):</h6>
        <span>WebCliGui Server</span>
      </div>

      <WaitAndError fetchAndError={submitOperationFetchAndError} />
      {!!operationStatus && (
        <div>
          <h5>Status:</h5>
          <div className="grid grid-cols-[75px_1fr]">
            <div>uuid</div><div>{operationStatus.uuid}</div>
            <div>status</div><div>{operationStatus.status}</div>
            <div>start time</div><div>{operationStatus.startTime.toLocaleString()}</div>
            <div>folder</div><div>{operationStatus.folder}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;
