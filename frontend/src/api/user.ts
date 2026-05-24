import axios from "axios";
import type { SignupData } from "../lib/Types";

const baseUrl = import.meta.env.VITE_API_URL;

export async function getAuthUserJwt() {
  const response = await axios.get(`${baseUrl}`);
  return response.data;
}

export async function signupUser(data: SignupData) {
  const response = await axios.post(`${baseUrl}/auth/signup`, data);
  return response.data;
}
