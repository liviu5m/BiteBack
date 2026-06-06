import type { FridgeItem } from "@/lib/Types";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL

export async function addItemFunc(data: FridgeItem) {
  const response = await axios.post(`${baseUrl}/api/item`, data, {
    withCredentials: true
  })
  return response.data
}

export async function getItemsByUser() {
  const response = await axios.get(`${baseUrl}/api/item`, {
    withCredentials: true
  })
  return response.data;
}

export async function getItemsByIds(ids: string[]) {
  const params = new URLSearchParams();
  ids.forEach(id => params.append('ids', id));
  console.log(params);

  const response = await axios.get(`${baseUrl}/api/item/ids`, {
    params: params,
    withCredentials: true
  });
  return response.data;
}

export async function getFoodByItems(ids: string[]) {
  const params = new URLSearchParams();
  ids.forEach(id => params.append('ids', id));
  console.log(params);

  const response = await axios.get(`${baseUrl}/api/item/food`, {
    params: params,
    withCredentials: true
  });
  return response.data;
}
