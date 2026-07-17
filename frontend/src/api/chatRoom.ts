import type { ChatRoom } from "@/lib/Types";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

export async function fetchUserRooms(userId: number) {
  const response = await axios.get(`${baseUrl}/api/chat-room/rooms/${userId}`, {
    withCredentials: true
  });
  return response.data;
}

export async function fetchMessageHistory(roomId: number, offset = 0) {
  const response = await axios.get(`${baseUrl}/api/chat-room/history/${roomId}`, {
    params: {
      limit: 10,
      offset,
    },
    withCredentials: true
  });
  return response.data;
}

export async function requestProduct({ itemId, currentUserId }: { itemId: number, currentUserId: number }) {
  const response = await axios.post(`${baseUrl}/api/product-request`, {
    item_id: itemId,
    user_id: currentUserId
  }, {
    withCredentials: true
  });
  return response.data;
}

export async function markRoomAsRead(roomId: number) {
  const response = await axios.put(`${baseUrl}/api/chat-room/read-all/${roomId}`, {}, {
    withCredentials: true
  });
  return response.data;
}
