import axios from "axios";
import API_URL from "../config";

export const sellerLogin = async (data: { email: string; password: string }) => {
  return await axios.post(`${API_URL}/seller-login`, data);
};