import type { ShareItemData } from "@/lib/Types";
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
