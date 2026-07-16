import type { FoodItem, ShareItemData } from "@/lib/Types";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

export async function addShareItemFunc(data: ShareItemData) {
  const response = await axios.post(`${baseUrl}/api/share-item`, data);
  return response.data;
}

export async function getShareItemsFunc(searchTerm: string, maxDistanceKm: number, coordinates: { lat: number, lng: number }) {
  const response = await axios.get(`${baseUrl}/api/share-item`, {
    params: {
      searchTerm,
      maxDistanceKm,
      lat: coordinates.lat,
      lng: coordinates.lng
    },
    withCredentials: true
  });
  return response.data;
}

export async function getMyListingsFunc() {
  const response = await axios.get(`${baseUrl}/api/share-item/user`, {
    withCredentials: true
  });
  return response.data;
}

export async function getMyRequestsFunc() {
  const response = await axios.get(`${baseUrl}/api/share-item/requested`, {
    withCredentials: true
  });
  return response.data;
}

export async function updateShareItemFunc(id: number, data: Partial<FoodItem>) {

  const response = await axios.patch(`${baseUrl}/api/share-item/${id}`, data, {
    withCredentials: true
  });
  return response.data;
}

export async function deleteShareItemFunc(id: number) {
  const response = await axios.delete(`${baseUrl}/api/share-item/${id}`, {
    withCredentials: true
  });
  return response.data;
}
