import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

export async function createProductRequestFunc(itemId: number, userId: number, ownerId: number) {
  const response = await axios.post(`${baseUrl}/api/product-request`, {
    item_id: itemId,
    user_id: userId,
    owner_id: ownerId
  }, {
    withCredentials: true
  });
  return response.data;
}

export async function getProductRequestsByOwnerIdFunc(userId: number, requesterId: number) {
  const response = await axios.get(`${baseUrl}/api/product-request/owner/${userId}`, {
    params: {
      requester_id: requesterId
    },
    withCredentials: true
  });
  return response.data;
}

export async function updateProductRequestFunc(id: number, status: string) {

  const response = await axios.put(`${baseUrl}/api/product-request/${id}`, {
    status: status
  }, {
    withCredentials: true
  });
  return response.data;
}

export async function deleteProductRequestFunc(id: number) {
  const response = await axios.delete(`${baseUrl}/api/product-request/${id}`, {
    withCredentials: true
  });
  return response.data;
}
