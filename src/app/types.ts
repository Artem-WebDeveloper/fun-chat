export const PageIDs = {
  MAIN_PAGE: 'main-page',
  ABOUT_PAGE: 'about-page',
  LOGIN_PAGE: 'login-page',
} as const;

export type User = {
  login: string;
  password: string;
};

export type IconOptions = {
  size?: number;
  className?: string;
  color?: string;
};
