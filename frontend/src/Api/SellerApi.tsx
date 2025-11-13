import axios from "axios";

const BASE_URL = "http://localhost:5000";

export const sellerLogin = async (data: { email: string; password: string }) => {
  return await axios.post(`${BASE_URL}/seller-login`, data);
};