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

export type ItemCategory = "pantry" | "meat" | "dairy" | "produce" | "bakery" | "other";

export type FridgeItem = {
  id: number;
  name: string;
  weight: string;
  category: ItemCategory;
  days: string;
}
