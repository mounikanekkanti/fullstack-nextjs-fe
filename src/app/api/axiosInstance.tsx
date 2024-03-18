import axios, { AxiosInstance } from "axios";

// Check if localStorage is available (for browser-side usage)
const authDetails: string | null = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

const instance: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 500000,
  headers: {
    Authorization: authDetails ? `JWT ${authDetails}` : null,
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

export default instance;
