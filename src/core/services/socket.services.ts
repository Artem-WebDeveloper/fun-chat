const BASE_URL = import.meta.env.VITE_API_URL;

class ChatSocket {
  socket: null | WebSocket = null;
  isConnected: boolean = false;

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
      console.log(JSON.parse(event.data));
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

  send() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.send(
      JSON.stringify({
        id: '2',
        type: 'USER_LOGIN',
        payload: {
          user: {
            login: 'test_user33',
            password: '123456',
          },
        },
      }),
    );
  }
}

export default new ChatSocket();
