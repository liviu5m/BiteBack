import axios from "axios";
import type { SignupData } from "../lib/Types";

const baseUrl = import.meta.env.VITE_API_URL;

export async function getAuthUserJwt() {
  const response = await axios.get(`${baseUrl}/api/user/jwt`, {
    withCredentials: true,
  });
  return response.data;
}

export async function signupUser(data: SignupData) {
  const response = await axios.post(`${baseUrl}/auth/signup`, data);
  return response.data;
}

export async function checkVerificationCode(code: string, userId: number) {
  const response = await axios.post(`${baseUrl}/auth/verify`, {
    code,
    userId,
  });
  return response.data;
}

export async function resendVerificationCode(userId: number) {
  const response = await axios.post(`${baseUrl}/auth/resend`, {
    userId,
  });
  return response.data;
}

export async function loginUserFunc(email: string, password: string) {
  const response = await axios.post(
    `${baseUrl}/auth/login`,
    {
      email,
      password,
    },
    {
      withCredentials: true,
    },
  );
  return response.data;
}

export async function logoutUser() {
  const response = await axios.post(`${baseUrl}/auth/logout`, {}, {
    withCredentials: true
  })
  return response.data;
}
