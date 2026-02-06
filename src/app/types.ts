export const PageIDs = {
  MAIN_PAGE: 'main-page',
  ABOUT_PAGE: 'about-page',
  LOGIN_PAGE: 'login-page',
} as const;

export type CurrentUser = {
  login: string;
  password: string;
};

export type IconOptions = {
  size?: number;
  className?: string;
  color?: string;
};

export type User = { login: string; isLogined: boolean; unreadCount?: number };

export type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  datetime: number;
  status: StatusMessage;
};

export type StatusMessage = {
  isDelivered: boolean;
  isReaded: boolean;
  isEdited: boolean;
};
