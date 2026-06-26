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
  expiryDate: string;
}

export type MissingIngredient = {
  name: string;
  importance: string;
}

export type UsedIngredient = {
  name: string,
  id: number
}

export type RecipeData = {
  id?: number;
  recipe_name: string;
  match_percentage: number;
  prep_time_minutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine_tag: string;
  hook_line: string;
  used_ingredients: UsedIngredient[];
  missing_ingredients: MissingIngredient[];
  preservation_tip: string;
  image_url?: string;
}
