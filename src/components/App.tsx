import React, { useEffect, useRef, useState } from 'react';
import { ListGroup, Tab, Tabs } from 'react-bootstrap';
import handleOnce from '@utils/handleOnce';
import useClickOutside from '@utils/useClickOutside';
import { useDataStore } from '@store/dataStore';
import { DataStoreIf } from '@store/dataStoreIf';
import { AuthenticationState } from '@store/authentication/authenticationIf';
import { FetchState } from '@store/fetchData';
import FaceIcon from '@icons/face-man-outline.svg';
import ErrorMessage from './regalia/ErrorMessage';
import WaitCircle from './regalia/WaitCircle';
import Authenticate from './Authenticate';
import CreateTask from './CreateTask';
import Status from './Status';

enum UserMenu {
  LOGOUT = 'Logout',
}

const doLogout = async (storeState: DataStoreIf) => {
  const { logout } = storeState.authentication;
  const { authenticationReset } = storeState.authentication;
  const { createTaskReset } = storeState.createTask;
  const { operationStatusReset } = storeState.operationStatus;

  const fetchStatus = await logout();
  if (fetchStatus !== FetchState.Success) {
    return false;
  }

  authenticationReset();
  createTaskReset();
  operationStatusReset();
  return true;  
};

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const storeState = useDataStore(state => state);
  const { logoutFetchAndError } = storeState.authentication;

  const logoutDisabled = logoutFetchAndError.fetchStatus === FetchState.Loading;

  useClickOutside(menuRef, () => setShowUserMenu(false));

  const handleUserMenu = async (value: string) => {
    switch (value) {
      case UserMenu.LOGOUT:
        await doLogout(storeState);
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
          <div ref={menuRef} className="absolute top-[33px] right-0 left-15 cursor-pointer">
            <ListGroup>
              <ListGroup.Item onClick={onLogoutClick}>
                <div className="flex items-center h-5">
                  <span className={`mr-3 ${logoutDisabled ? 'text-gray-300' : ''}`}>Logout</span>
                  {logoutFetchAndError.fetchStatus === FetchState.Loading &&
                    <WaitCircle className="h-4! w-4!" />}
                </div>
              </ListGroup.Item>
            </ListGroup>
          </div>
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
