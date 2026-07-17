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

export type ShareItemData = {
  name: string;
  expiryDate: string;
  weight: number;
  notes?: string;
  location: string;
  userId: number;
}

export interface FoodItem {
  id: string;
  name: string;
  expiryDate: string;
  weight: string;
  addressText: string;
  location: string;
  notes?: string;
  claimedBy?: string | null;
  owner_username?: string;
  owner_id?: number;
}

export type ProductRequestData = {
  userId: number;
  itemId: number;
  ownerId: number;
}

export type ChatRoom = {
  id: number;
  user_one_id: number;
  user_two_id: number;
  user_one_username: string;
  user_two_username: string;
  unread_count: number;
}

export type ProductRequestDetails = {
  id: number;
  share_item_id: number;
  requester_id: number;
  owner_id: number;
  status: 'pending' | 'accepted' | 'completed';
  createdAt: string;
}

export type RequestedItemWithStatus = {
  share_item: FoodItem;
  request: ProductRequestDetails;
}
