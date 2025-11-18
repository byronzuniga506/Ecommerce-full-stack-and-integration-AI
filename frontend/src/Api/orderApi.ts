import API_URL from "../config";

// src/api/orderApi.ts
export interface OrderItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

export interface AddressInfo {
  fullName: string;
  phone: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
}

const BASE_URL = API_URL;

//  Save order in database
export const saveOrder = async (
  email: string,
  fullName: string,
  items: OrderItem[],
  totalPrice: number,
  address: AddressInfo
) => {
  try {
    const response = await fetch(`${BASE_URL}/save-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, items, totalPrice, address }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to save order");

    return data;
  } catch (err: any) {
    console.error(" Error saving order:", err.message);
    throw err;
  }
};

//  Send order confirmation email
export const sendOrderEmail = async (
  email: string,
  fullName: string,
  items: OrderItem[],
  totalPrice: number,
  address: AddressInfo
) => {
  try {
    const response = await fetch(`${BASE_URL}/send-order-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, items, totalPrice, address }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to send order email");

    return data;
  } catch (err: any) {
    console.error(" Error sending order email:", err.message);
    throw err;
  }
};
