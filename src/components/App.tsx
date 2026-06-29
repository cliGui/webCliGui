import React, { useEffect, useState } from 'react';
import { ListGroup, Tab, Tabs } from 'react-bootstrap';
import { useDataStore } from '@store/dataStore';
import FaceIcon from '@icons/face-man-outline.svg';
import Authenticate from './Authenticate';
import CreateTask from './CreateTask';
import Status from './Status';
import ErrorMessage from './regalia/ErrorMessage';
import { AuthenticationState } from '@store/authentication/authenticationIf';
import { FetchState } from '@utils/fetchData';
import WaitCircle from './regalia/WaitCircle';
import handleOnce from '@utils/handleOnce';
import { DataStoreIf } from '@store/dataStoreIf';

enum UserMenu {
  LOGOUT = 'Logout',
}

const doLogout = async (storeState: DataStoreIf) => {
  const { logout } = storeState.authentication;
  const { createTaskReset } = storeState.createTask;
  const { operationStatusReset } = storeState.operationStatus;

  await logout();
  createTaskReset();
  operationStatusReset();
};

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const storeState = useDataStore(state => state);
  const { logoutFetchAndError } = storeState.authentication;

  const logoutDisabled = logoutFetchAndError.fetchStatus === FetchState.Loading;

  const handleUserMenu = async (value: string) => {
    switch (value) {
      case UserMenu.LOGOUT:
        doLogout(storeState);
        setShowUserMenu(false);
        break;

      default:
        console.error(`App.handleUserMenu(): unknown value '${value}'`);
    }
  }

  const onLogoutClick = () => {
    if (logoutDisabled) return;
    handleUserMenu(UserMenu.LOGOUT);
  }

  return (
    <div className="flex justify-between items-start">
      <h3 className="pb-4">Web UI Command Services Executor</h3>
      <div className="flex flex-row justify-end items-start relative w-45">
        <ErrorMessage fetchAndError={logoutFetchAndError} showLeft className="mr-1" />
        <button className="w-[30px] h-[30px] shrink-0" onClick={() => setShowUserMenu(!showUserMenu)}>
          <img width="30px" height="30px" src={FaceIcon} alt="face" />
        </button>
        
        {showUserMenu &&
          <ListGroup className="absolute top-[33px] right-0 left-15 cursor-pointer">
            <ListGroup.Item onClick={onLogoutClick}>
              <div className="flex items-center h-5">
                <span className={`mr-3 ${logoutDisabled ? 'text-gray-300' : ''}`}>Logout</span>
                {logoutFetchAndError.fetchStatus === FetchState.Loading &&
                    <WaitCircle className="h-4! w-4!" />}
              </div>
            </ListGroup.Item>
          </ListGroup>
        }
      </div>
    </div>
  );
};

const TabsContainer = () => {
  const [selectedTabKey, setSelectedTabKey] = useState('createTask');

  return (
    <Tabs defaultActiveKey="createTask" 
        mountOnEnter
        activeKey={selectedTabKey}
        onSelect={(tab: string | null) => setSelectedTabKey(tab as string)}
        className="mb-3 container-tabs">

      <Tab eventKey="createTask" title="Create task">
        <CreateTask />
      </Tab>

      <Tab eventKey="status" title="Status">
        <Status />
      </Tab>
    </Tabs>
  );
};

const App  = () => {
  const { authenticationState, getAccessToken } = useDataStore(state => state.authentication);

  useEffect(() => {
    const closeHandleOnce = handleOnce(getAccessToken);
    return closeHandleOnce;
  }, []);

  return (
    <>
      <div className="flex flex-col p-5 pt-3 pb-3 max-w-[1325px]">
        <Header />
        <TabsContainer />
      </div>

      {authenticationState !== AuthenticationState.Authenticated &&
        <Authenticate />}
    </>
  );
};

export default App;
