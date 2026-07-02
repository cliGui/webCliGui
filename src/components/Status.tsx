import React, { useEffect } from 'react';
import { useDataStore } from '@store/dataStore';
import { FetchState } from '@store/fetchData';
import {
  TABLE_CLASSNAME, THEAD_CLASSNAME, TBODY_CLASSNAME, TR_CLASSNAME, TH_CLASSNAME, TD_CLASSNAME,
  OPERATION_CLASSNAME, START_TIME_CLASSNAME, ELAPSED_TIME_CLASSNAME, STATUS_CLASSNAME,
  FOLDER_CLASSNAME,
} from './constants';
import WaitAndError from './regalia/WaitAndError';
import Button from './regalia/Button';
import { AuthenticationState } from '@store/authentication/authenticationIf';

const NUM_COLS = 5;
const NUM_OPERATION_STATUS_PER_PAGE = 25;
const REFRESH_INTERVAL = 15000;

const RefreshButtons = () => {
  const { authenticationState } = useDataStore(state => state.authentication);
  const {
    operationStatusList,
    totalNumOperationStatus,
    isAutomaticRefresh,
    automaticRefreshTimer,

    getOperationStatusList,
    toggleAutomaticRefresh,
    setAutomaticRefreshTimer,
  } = useDataStore(state => state.operationStatus);

  const onRefresh = () => {
    const numPages = Math.floor(operationStatusList.length / NUM_OPERATION_STATUS_PER_PAGE) + 1;
    getOperationStatusList(0, numPages * NUM_OPERATION_STATUS_PER_PAGE, true);
  };

  useEffect(() => {
    if (isAutomaticRefresh) {
      const timer = window.setInterval(onRefresh, REFRESH_INTERVAL);
      setAutomaticRefreshTimer(timer);
    } else {
      window.clearInterval(automaticRefreshTimer);
      setAutomaticRefreshTimer(-1);
    }
  }, [isAutomaticRefresh]);

  const isDisabled = authenticationState !== AuthenticationState.Authenticated;

  return (
    <div className="flex flex-row justify-end gap-4 items-center mb-3">
      <div className="flex flex-row items-center gap-2">
        <span>Automatic refresh</span>
        <input type="checkbox" name="toggleAutomaticRefresh" checked={isAutomaticRefresh} 
               onChange={toggleAutomaticRefresh} disabled={isDisabled} />
      </div>

      <Button onClick={onRefresh} disabled={isDisabled}>
        Refresh
      </Button>
    </div>
  );
};

const MoreButton = () => {
  const { authenticationState } = useDataStore(state => state.authentication);
  const {
    operationStatusList,
    totalNumOperationStatus,
    getOperationStatusList,
   } = useDataStore(state => state.operationStatus);

  const onMoreClick = () => {
    const numPages = Math.floor(operationStatusList.length / NUM_OPERATION_STATUS_PER_PAGE);
    const nextNumStatus = (numPages + 1) * NUM_OPERATION_STATUS_PER_PAGE;
    getOperationStatusList(operationStatusList.length, nextNumStatus, true);
  };

  const isDisabled = authenticationState !== AuthenticationState.Authenticated;

  return (
    <>
      {operationStatusList.length < totalNumOperationStatus &&
        <Button className="w-20 !my-3" onClick={onMoreClick} disabled={isDisabled}>
          More
        </Button>}
    </>
  );
};

const MINUTE_IN_S = 60;
const HOUR_IN_S = 60 * MINUTE_IN_S;
const DAY_IN_S = 24 * HOUR_IN_S;

const elapsedTimeStr = (duration:  number | null) => {
  if (duration === null) return '';

  let roundedDur = Math.round(duration);
  const days = Math.floor(roundedDur / DAY_IN_S);
  roundedDur %= DAY_IN_S;

  const hours = Math.floor(roundedDur / HOUR_IN_S);
  roundedDur %= HOUR_IN_S;

  const minutes = Math.floor(roundedDur / MINUTE_IN_S);
  const seconds = roundedDur % MINUTE_IN_S;

  let timeStr = `${seconds}s`;
  if (minutes > 0) timeStr = `${minutes}m ${timeStr}`;
  if (hours > 0) timeStr = `${hours}h ${timeStr}`;
  if (days > 0) timeStr = `${days}d ${timeStr}`;
  return timeStr;
}

const StatusTable = () => {
  const {
    operationStatusList,
    getOperationStatusListFetchAndError,
   } = useDataStore(state => state.operationStatus);

  return (
    <table className={TABLE_CLASSNAME}>
      <thead className={THEAD_CLASSNAME}>
        <tr className={TR_CLASSNAME}>
          <th className={`${TH_CLASSNAME} ${OPERATION_CLASSNAME}`}>Operation</th>
          <th className={`${TH_CLASSNAME} ${START_TIME_CLASSNAME}`}>Start time</th>
          <th className={`${TH_CLASSNAME} ${ELAPSED_TIME_CLASSNAME}`}>Elapsed time</th>
          <th className={`${TH_CLASSNAME} ${STATUS_CLASSNAME}`}>Status</th>
          <th className={`${TH_CLASSNAME} ${FOLDER_CLASSNAME}`}>Folder</th>
        </tr>
      </thead>
      <tbody className={TBODY_CLASSNAME}>
        {operationStatusList.map(stat => (
          <tr key={stat.uuid} className={TR_CLASSNAME}>
            <td className={`${TD_CLASSNAME} ${OPERATION_CLASSNAME}`} data-label="Operation">{stat.operationBranch.join('/')}</td>
            <td className={`${TD_CLASSNAME} ${START_TIME_CLASSNAME}`} data-label="Start time">{stat.startTime.toLocaleString()}</td>
            <td className={`${TD_CLASSNAME} ${ELAPSED_TIME_CLASSNAME}`} data-label="Elapsed time">{elapsedTimeStr(stat.elapsedTime)}</td>
            <td className={`${TD_CLASSNAME} ${STATUS_CLASSNAME}`} data-label="Status">{stat.status}</td>
            <td className={`${TD_CLASSNAME} ${FOLDER_CLASSNAME}`} data-label="Folder">
              <a href={`/api/folder-access/${stat.folder}`} target="_blank" rel="noopener noreferrer">
                {stat.folder}
              </a>
            </td>
          </tr>
        ))}
        {(getOperationStatusListFetchAndError.fetchStatus === FetchState.Success && operationStatusList.length === 0) && (
          <tr className="border border-gray-500">
            <td className="no-data-message p-1" colSpan={NUM_COLS}>
              No operations available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

const Status = () => {
  const { authenticationState } = useDataStore(state => state.authentication);
  const {
    getOperationStatusListFetchAndError,
    getOperationStatusList,
   } = useDataStore(state => state.operationStatus);

   useEffect(() => {
    if (authenticationState === AuthenticationState.Authenticated) {
      getOperationStatusList(0, NUM_OPERATION_STATUS_PER_PAGE);
    }
   }, [authenticationState]);

   return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <WaitAndError fetchAndError={getOperationStatusListFetchAndError} />
        <RefreshButtons />
      </div>
      <StatusTable />
      <MoreButton />
    </div>
   );
};

export default Status;
