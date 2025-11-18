import axios from "axios";
import API_URL from "../config";
const API_BASE_URL = API_URL;

export const sendOtp = async (email: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send-otp`, { email });
    return response.data;
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    throw error.response?.data || { message: "Failed to send OTP" };
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
    return response.data;
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    throw error.response?.data || { message: "Invalid OTP" };
  }
};

// ✅ Signup new user (after OTP verified)
export const signupUser = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, userData);
    return response.data;
  } catch (error: any) {
    console.error("Error signing up:", error);
    throw error.response?.data || { message: "Signup failed" };
  }
};

// Signup new user (after OTP verified)
export const sellerSignup = async (userData: {
  name: string;
  email: string;
  password: string;
  storeName:string;
  store_description:string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/seller-signup`, userData);
    return response.data;
  } catch (error: any) {
    console.error("Error signing up:", error);
    throw error.response?.data || { message: "Signup failed" };
  }
};

