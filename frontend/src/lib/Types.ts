export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  provider: string;
  createdAt: string;
};

export type SignupData = {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type LoginData = {
  email: string;
  password: string;
};
