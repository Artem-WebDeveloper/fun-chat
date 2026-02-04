import { PageIDs, type CurrentUser, type User } from '../../app/types';
import navigate from '../utils/navigate';

const BASE_URL = import.meta.env.VITE_API_URL;

class ChatSocket {
  socket: null | WebSocket = null;
  isConnected: boolean = false;

  isAuthorized: boolean = false;
  curUser: null | string = null;
  curPassword: string | null = null;

  otherUsers: Record<string, User> = {};

  onServerError?: (message: string) => void;
  updateUsers?: (allUsers: Record<string, User>) => void;

  onConnectionChange?: (connected: boolean) => void;

  private setConnectionState(connected: boolean) {
    this.isConnected = connected;
    this.onConnectionChange?.(connected);
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    this.socket = new WebSocket(`ws://${BASE_URL}`);

    this.socket.onopen = () => {
      console.log('[OPEN] Connection established!');
      this.setConnectionState(true);
    };

    this.socket.onmessage = (event) => {
      console.log(`[MESSAGE] ↓`);
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.type === 'USER_LOGIN' && data.payload.user.isLogined) {
        this.handleUserlogin();
        this.curUser = data.payload.user.login;
        this.isAuthorized = data.payload.user.isLogined;
      }

      if (data.type === 'USER_LOGOUT' && !data.payload.user.isLogined) {
        this.handleUserlogout();
        this.clearAuth();
      }

      if (data.type === 'ERROR' && data.payload.error) {
        this.onServerError?.(data.payload.error);
      }

      if (data.type === 'USER_EXTERNAL_LOGIN') {
        const user = data.payload.user;

        if (user.login === this.curUser) return;

        this.updateUser(user.login, user);
        this.updateUsers?.({ ...this.otherUsers });
      }

      if (data.type === 'USER_EXTERNAL_LOGOUT') {
        const user = data.payload.user;
        if (user.login === this.curUser) {
          this.clearAuth();
          navigate(PageIDs.LOGIN_PAGE);
        } else {
          this.updateUser(user.login, user);
          this.updateUsers?.({ ...this.otherUsers });
        }
      }

      if (data.type === 'USER_ACTIVE' || data.type === 'USER_INACTIVE') {
        data.payload.users.forEach((user: User) => {
          if (user.login === this.curUser) return;
          this.updateUser(user.login, user);
        });

        this.updateUsers?.({ ...this.otherUsers });
      }
    };

    this.socket.onerror = (error) => {
      console.warn('ChatSocket Error!', error);
      this.setConnectionState(false);
    };

    this.socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`[CLOSE] The connection was closed clean, code: ${event.code}`);
      } else {
        console.log(`[CLOSE] The connection was interrupted`);
      }
      this.setConnectionState(false);
      this.socket = null;
    };
  }

  loginUser(user: CurrentUser) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    const loginData = {
      id: String(Date.now()),
      type: 'USER_LOGIN',
      payload: {
        user,
      },
    };

    this.curPassword = user.password;
    this.socket.send(JSON.stringify(loginData));
  }

  logoutUser() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }
    const loginData = {
      id: String(Date.now()),
      type: 'USER_LOGOUT',
      payload: {
        user: {
          login: this.curUser,
          password: this.curPassword,
        },
      },
    };

    this.socket.send(JSON.stringify(loginData));
  }

  getAllUsers() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }
    const loginDataActive = {
      id: String(Date.now()),
      type: 'USER_ACTIVE',
      payload: null,
    };

    const loginDataInActive = {
      id: String(Date.now()),
      type: 'USER_INACTIVE',
      payload: null,
    };

    this.socket.send(JSON.stringify(loginDataActive));
    this.socket.send(JSON.stringify(loginDataInActive));
  }

  private clearAuth() {
    this.curUser = null;
    this.curPassword = null;
    this.isAuthorized = false;
  }

  private updateUser(login: string, user: User) {
    this.otherUsers[login] = {
      ...this.otherUsers[login],
      ...user,
    };
  }

  handleUserlogin() {
    console.log('Login succes');
    navigate(PageIDs.MAIN_PAGE);
    this.getAllUsers();
  }

  handleUserlogout() {
    console.log('Logout succes');
    navigate(PageIDs.LOGIN_PAGE);
  }
}

export default new ChatSocket();
