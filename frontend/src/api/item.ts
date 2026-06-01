import type { FridgeItem } from "@/lib/Types";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL

export async function addItemFunc(data: FridgeItem) {
  const response = await axios.post(`${baseUrl}/api/item`, data, {
    withCredentials: true
  })
  return response.data
}
