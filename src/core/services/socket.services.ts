import {
  PageIDs,
  type CurrentUser,
  type Message,
  type StatusMessage,
  type User,
} from '../../app/types';
import generateId from '../utils/generateId';
import navigate from '../utils/navigate';

const BASE_URL = import.meta.env.VITE_API_URL;

class ChatSocket {
  socket: null | WebSocket = null;
  isConnected: boolean = false;

  isAuthorized: boolean = false;
  curUser: null | string = null;
  curPassword: string | null = null;

  otherUsers: Record<string, User> = {};
  unreadCountRequests: Record<string, string> = {};

  messages: Record<string, Message[]> = {};
  deletedMessageIds: Set<string> = new Set();
  selectedUser: null | string = null;

  onServerError?: (message: string) => void;
  updateUsers?: (allUsers: Record<string, User>) => void;
  updateStatusDialogUser?: (isLogined: boolean) => void;
  onMessage?: (message: Message) => void;
  onDeleteMessage?: (id: string) => void;
  onMessageStatus?: (messageId: string, status: StatusMessage) => void;
  onHistory?: () => void;

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
        this.clearSession();
      }

      if (data.type === 'ERROR' && data.payload.error) {
        this.onServerError?.(data.payload.error);
      }

      if (data.type === 'USER_EXTERNAL_LOGIN') {
        const user = data.payload.user;

        if (user.login === this.curUser) return;
        if (user.login === this.selectedUser) {
          this.updateStatusDialogUser?.(user.isLogined);
        }

        this.updateUser(user.login, user);
        this.fetchUnreadCount(user.login);
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

          if (user.login === this.selectedUser) {
            this.updateStatusDialogUser?.(user.isLogined);
          }
        }
      }

      if (data.type === 'USER_ACTIVE' || data.type === 'USER_INACTIVE') {
        data.payload.users.forEach((user: User) => {
          if (user.login === this.curUser) return;
          this.updateUser(user.login, user);

          if (user.login === this.selectedUser) {
            this.updateStatusDialogUser?.(user.isLogined);
          }
          this.fetchUnreadCount(user.login);
          this.fetchHistoryMessages(user.login);
        });

        this.updateUsers?.({ ...this.otherUsers });
      }

      if (data.type === 'MSG_SEND') {
        const message: Message = data.payload.message;
        const dialogUser = message.from === this.curUser ? message.to : message.from;

        (this.messages[dialogUser] ??= []).push(message);

        if (dialogUser === this.selectedUser) {
          this.onMessage?.(message);
        } else {
          this.fetchUnreadCount(dialogUser);
        }
      }

      if (data.type === 'MSG_FROM_USER') {
        const historyMessages: Message[] = data.payload.messages;
        console.log(this.deletedMessageIds);
        if (this.selectedUser) {
          this.messages[this.selectedUser] = historyMessages.filter(
            (message) => !this.deletedMessageIds.has(message.id),
          );
          console.log(this.messages);

          // this.messages[this.selectedUser] = historyMessages.filter((message) => {});

          this.onHistory?.();
        }
      }

      if (data.type === 'MSG_COUNT_NOT_READED_FROM_USER') {
        const login = this.unreadCountRequests[data.id];

        if (login && this.otherUsers[login]) {
          this.otherUsers[login].unreadCount = data.payload.count;
          this.updateUsers?.({ ...this.otherUsers });

          delete this.unreadCountRequests[data.id];
        }
      }

      if (data.type === 'MSG_DELIVER') {
        const messageId = data.payload.message.id;
        const status = data.payload.message.status;

        Object.keys(this.messages).forEach((dialogUser) => {
          const message = this.messages[dialogUser].find((message) => message.id === messageId);
          if (message) {
            message.status.isDelivered = status.isDelivered;
            if (dialogUser === this.selectedUser && message.from === this.curUser) {
              this.onMessageStatus?.(message.id, message.status);
            }
          }
        });
      }

      if (data.type === 'MSG_READ') {
        const messageId = data.payload.message.id;
        const status = data.payload.message.status;

        Object.keys(this.messages).forEach((dialogUser) => {
          const message = this.messages[dialogUser].find((message) => message.id === messageId);
          if (message) {
            message.status.isReaded = status.isReaded;
            if (dialogUser === this.selectedUser) {
              this.fetchUnreadCount(this.selectedUser);
            }
            if (message.from === this.curUser) {
              this.onMessageStatus?.(message.id, message.status);
            }
          }
        });
      }

      if (data.type === 'MSG_DELETE') {
        const messageId = data.payload.message.id;
        this.deletedMessageIds.add(messageId);

        Object.keys(this.messages).forEach((dialogUser) => {
          this.fetchUnreadCount(dialogUser);

          this.messages[dialogUser] = this.messages[dialogUser].filter(
            (message) => message.id !== messageId,
          );
        });

        this.onDeleteMessage?.(messageId);
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
      this.clearAuth();
      this.clearSession();
    };
  }

  loginUser(user: CurrentUser) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    const loginData = {
      id: generateId(user.login),
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
      id: generateId(this.curUser || 'login'),
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
      id: generateId('active'),
      type: 'USER_ACTIVE',
      payload: null,
    };

    const loginDataInActive = {
      id: generateId('inActive'),
      type: 'USER_INACTIVE',
      payload: null,
    };

    this.socket.send(JSON.stringify(loginDataActive));
    this.socket.send(JSON.stringify(loginDataInActive));
  }

  sendMessage(message: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }
    const data = {
      id: generateId(this.curUser || 'login'),
      type: 'MSG_SEND',
      payload: {
        message: {
          to: this.selectedUser,
          text: message,
        },
      },
    };
    this.socket.send(JSON.stringify(data));
  }

  sendReadStatus() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }
    if (!this.selectedUser) return;

    const unReadMessages = this.messages[this.selectedUser].filter(
      (message) => message.status.isReaded !== true && message.from !== this.curUser,
    );

    unReadMessages.forEach((message) => {
      const data = {
        id: generateId(this.selectedUser || ''),
        type: 'MSG_READ',
        payload: {
          message: {
            id: message.id,
          },
        },
      };
      if (this.socket) this.socket.send(JSON.stringify(data));
    });
  }

  fetchHistoryMessages(login: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }
    const data = {
      id: generateId(login),
      type: 'MSG_FROM_USER',
      payload: {
        user: {
          login,
        },
      },
    };
    this.socket.send(JSON.stringify(data));
  }

  private clearAuth() {
    this.curUser = null;
    this.curPassword = null;
    this.isAuthorized = false;
  }

  private clearSession() {
    this.selectedUser = null;
    this.messages = {};
    this.otherUsers = {};
    this.unreadCountRequests = {};
    this.deletedMessageIds.clear();
  }

  private updateUser(login: string, user: User) {
    this.otherUsers[login] = {
      ...this.otherUsers[login],
      ...user,
    };
  }

  public setSelectedUser(user: string) {
    this.selectedUser = user;
    // this.fetchHistoryMessages(user);

    if (!this.messages[user] || this.messages[user].length === 0) {
      this.fetchHistoryMessages(user);
    } else {
      this.onHistory?.();
    }
  }

  fetchUnreadCount(login: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    const data = {
      id: generateId(login),
      type: 'MSG_COUNT_NOT_READED_FROM_USER',
      payload: {
        user: { login },
      },
    };

    this.unreadCountRequests[data.id] = login;
    this.socket.send(JSON.stringify(data));
  }

  deleteMessage(id: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }
    const data = {
      id,
      type: 'MSG_DELETE',
      payload: {
        message: {
          id,
        },
      },
    };

    this.socket.send(JSON.stringify(data));
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
