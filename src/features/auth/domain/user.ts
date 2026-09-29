/** Entity: what the app works with. Decoupled from the API shape (see data/auth.dto.ts). */
export type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
};

export type Credentials = {
  username: string;
  password: string;
};
