import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import WaitCircle from "./regalia/WaitCircle";
import { useDataStore } from "@store/dataStore";
import { AuthenticationState } from "@store/authentication/authenticationIf";

const Authenticate = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { 
    login,
    clearLoginError,
    loginFetchAndError,
    authenticationState,
   } = useDataStore(state => state.authentication);

  // Show wait cursor
  if (authenticationState === AuthenticationState.Initialize ||
      authenticationState === AuthenticationState.Authenticating) {
    return (
      <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-[#00000020]">
        <WaitCircle className="w-10 h-10"/>
      </div>
    );
  }

  // Show login dialog
  if (authenticationState === AuthenticationState.LoggedOut ||
      authenticationState === AuthenticationState.AuthenticationFailed) {
    const errorDetail = loginFetchAndError.errorDetail;

    return (
      <Modal show backdrop="static" keyboard={false} centered>
        <Modal.Header>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={evt => {
                  loginFetchAndError.error && clearLoginError();
                  setUsername(evt.target.value);
                }}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={evt => {
                  loginFetchAndError.error && clearLoginError();
                  setPassword(evt.target.value)
                }}
                onKeyDown={evt => { if (evt.key === 'Enter') login(username, password); }}
              />
            </Form.Group>
          </Form>

          {errorDetail && <div className="error-message mb-3">{errorDetail}</div>}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={() => login(username, password)}>
            Login
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // We must be authenticated, nothing to show
  return null;
};

export default Authenticate;
