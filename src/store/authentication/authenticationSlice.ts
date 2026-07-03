import { StateCreator  } from 'zustand';
import { GetFunction, SetFunction } from '../dataStoreTypes';
import { DataStoreIf } from '../dataStoreIf';
import { AuthenticationState, AuthenticationIf } from './authenticationIf';
import fetchData, { FetchState, FetchStatus, handleFetchStatusAndError, initFetchStatusAndError } from '@store/fetchData';

const REFRESH_ACCESS_TOKEN_TIMEOUT = 1000 * 60 * 55; // 55 minutes

const setupRefreshAccessToken = (get: GetFunction, set: SetFunction) => {
  clearTimeout(get().authentication.refreshAccessTokenTimeout);
  const timeout = window.setTimeout(() => doGetAccessToken(get, set), REFRESH_ACCESS_TOKEN_TIMEOUT);
  set(state => { 
    state.authentication.refreshAccessTokenTimeout = timeout; 
  }, false, 'setupRefreshAccessToken');
}

const doLogin = async (get: GetFunction, set: SetFunction, username: string, password: string): Promise<FetchStatus> => {
  const handleFandE = handleFetchStatusAndError(get, set, ['authentication', 'loginFetchAndError']);

  set(state => { state.authentication.authenticationState = AuthenticationState.Authenticating; },
      false, 'login_Authenticating');

  interface AccessTokenJson { access: string; }

  const setData = (jsonData: AccessTokenJson) => {
    set(state => {
      state.authentication.accessToken = jsonData.access;
      state.authentication.authenticationState = AuthenticationState.Authenticated;
    }, false, 'login');
  };

  const result = await fetchData<AccessTokenJson, { username: string; password: string }>(
    '/api/login', {
      handleFandE,
      setData, 
      postData: { username, password },
    }
  );

  if (result === FetchState.Success) {
    setupRefreshAccessToken(get, set);
  } else if (result === FetchState.Error) {
    set(state => { state.authentication.authenticationState = AuthenticationState.AuthenticationFailed; },
        false, 'login_AuthenticationFailed');
  }
  return result;
};

const doGetAccessToken = async (get: GetFunction, set: SetFunction): Promise<FetchStatus> => {
  const handleFandE = handleFetchStatusAndError(get, set, ['authentication', 'getAccessTokenFetchAndError']);

  set(state => { state.authentication.authenticationState = AuthenticationState.Authenticating; },
      false, 'getAccessToken_Authenticating');

  interface AccessTokenJson {
    access: string;
  }

  const setData = (jsonData: AccessTokenJson) => {
    set(state => {
      state.authentication.accessToken = jsonData.access;
      state.authentication.authenticationState = AuthenticationState.Authenticated;
    }, false, 'getAccessToken');
  };

  const result = await fetchData<AccessTokenJson>(
    '/api/get-access-token',
    {
      handleFandE,
      setData,
    }
  );

  if (result === FetchState.Success) {
    setupRefreshAccessToken(get, set);
  } else if (result === FetchState.Error) {
    set(state => { 
      state.authentication.authenticationState = AuthenticationState.AuthenticationFailed; 
      state.authentication.accessToken = undefined;
      state.authentication.refreshAccessTokenTimeout = 0;
    },
      false, 'getAccessToken_AuthenticationFailed');
  }

  return result;
};

const doLogout = async (get: GetFunction, set: SetFunction): Promise<FetchStatus> => {
  const handleFandE = handleFetchStatusAndError(get, set, ['authentication', 'logoutFetchAndError']);

  const setData = () => {
    set(state => {
      state.authentication.accessToken = undefined;
      state.authentication.authenticationState = AuthenticationState.LoggedOut;
    }, false, 'logout');
  };

  const accessToken = get().authentication.accessToken;

  return await fetchData('/api/logout', {
    accessToken,
    handleFandE, 
    setData, 
    postData: undefined,
  });
};

const doAuthenticationReset = (get: GetFunction, set: SetFunction) => {
  clearTimeout(get().authentication.refreshAccessTokenTimeout);
  set(state => { 
    state.authentication.accessToken = undefined;
    state.authentication.refreshAccessTokenTimeout = 0; 
    state.authentication.loginFetchAndError = initFetchStatusAndError('login');
    state.authentication.getAccessTokenFetchAndError = initFetchStatusAndError('getAccessToken');
  }, false, 'authenticationReset');
};

export const authenticationSlice: StateCreator<
  DataStoreIf,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  AuthenticationIf
> = (set, get) => ({
  authenticationState: AuthenticationState.Initialize,
  accessToken: undefined,
  refreshAccessTokenTimeout: 0,
  loginFetchAndError: initFetchStatusAndError('login'),
  getAccessTokenFetchAndError: initFetchStatusAndError('getAccessToken'),
  logoutFetchAndError: initFetchStatusAndError('logout'),

  login: async (username, password) => await doLogin(get, set, username, password),
  clearLoginError: () => set(state => {
      state.authentication.loginFetchAndError.fetchStatus = FetchState.Idle;
      state.authentication.loginFetchAndError.error = null;
      state.authentication.loginFetchAndError.errorDetail = null;
    }, false, 'clearLoginError'),
  getAccessToken: async () => await doGetAccessToken(get, set),
  logout: async () => await doLogout(get, set),
  authenticationReset: () => doAuthenticationReset(get, set),
});
