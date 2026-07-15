import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

export async function createProductRequestFunc(itemId: number, userId: number) {
  const response = await axios.post(`${baseUrl}/api/product-request`, {
    item_id: itemId,
    user_id: userId
  }, {
    withCredentials: true
  });
  return response.data;
}
