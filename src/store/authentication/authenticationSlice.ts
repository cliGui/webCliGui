import { StateCreator  } from 'zustand';
import { GetFunction, SetFunction } from '../dataStoreTypes';
import { DataStoreIf } from '../dataStoreIf';
import { AuthenticationState, AuthenticationIf } from './authenticationIf';
import fetchData, { FetchState, FetchStatus, handleFetchStatusAndError, initFetchStatusAndError } from '@store/fetchData';

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

  if (result === FetchState.Error) {
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

  // Also update authenticationState
  if (result === FetchState.Error) {
    set(state => { state.authentication.authenticationState = AuthenticationState.AuthenticationFailed; },
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

export const authenticationSlice: StateCreator<
  DataStoreIf,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  AuthenticationIf
> = (set, get) => ({
  authenticationState: AuthenticationState.Initialize,
  accessToken: undefined,
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
});
