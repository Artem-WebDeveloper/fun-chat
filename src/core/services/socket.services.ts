import { PageIDs, type User } from '../../app/types';

const BASE_URL = import.meta.env.VITE_API_URL;

class ChatSocket {
  socket: null | WebSocket = null;
  isConnected: boolean = false;

  isAuthorized: boolean = false;
  curUser: null | string = null;

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

  loginUser(user: User) {
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

    this.socket.send(JSON.stringify(loginData));
  }

  handleUserlogin() {
    console.log('Login succes');
    window.location.hash = PageIDs.MAIN_PAGE;
  }
}

export default new ChatSocket();
