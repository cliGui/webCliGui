import { FetchStatus, FetchStatusAndError } from "@store/fetchData";

export enum AuthenticationState {
  Initialize = 'Initialize',
  Authenticating = 'Authenticating',
  Authenticated = 'Authenticated',
  AuthenticationFailed = 'AuthenticationFailed',
  LoggedOut = 'LoggedOut',
}

export interface AuthenticationIf {
  authenticationState: AuthenticationState;
  accessToken: string | undefined;
  refreshAccessTokenTimeout: number;
  
  loginFetchAndError: FetchStatusAndError;
  getAccessTokenFetchAndError: FetchStatusAndError;
  logoutFetchAndError: FetchStatusAndError;

  login: (username: string, password: string) => Promise<FetchStatus>;
  clearLoginError: () => void;
  getAccessToken: () => Promise<FetchStatus>;
  logout: () => Promise<FetchStatus>;
  authenticationReset: () => void;
}
