import type { RecipeData } from "@/lib/Types";
import axios from "axios"

const baseUrl = import.meta.env.VITE_API_URL

export async function saveRecipeFunc(data: RecipeData) {
  const payload = {
    ...data,
    missing_ingredients: JSON.stringify(data.missing_ingredients),
    used_ingredients: JSON.stringify(data.used_ingredients),
  };
  const response = await axios.post(`${baseUrl}/api/recipe/`, payload, {
    withCredentials: true
  })
  return response.data;
}
export async function deleteRecipeFunc(recipeId: number) {
  const response = await axios.delete(`${baseUrl}/api/recipe/${recipeId}`, {
    withCredentials: true
  })
  return response.data;
}

export async function findRecipeByUserId() {
  const response = await axios.get(`${baseUrl}/api/recipe/`, {
    withCredentials: true,
  })
  return response.data;
}
