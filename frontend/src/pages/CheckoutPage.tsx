import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Product } from "./ProductsPage";
import Popup from "../popup/Missinginfo"; 
import "../index.css";

interface CartItem extends Product {
  quantity: number;
}

interface CheckoutState {
  product?: Product;
  quantity?: number;
  cart?: CartItem[];
  totalPrice?: number;
}

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | undefined;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [countryCode, setCountryCode] = useState("+1");

  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  if (!state) return <p>Order details not found!</p>;

  const showPopup = (message: string) => {
    setPopupMessage(message);
  };

  const handleNext = () => {
    const trimmedFullName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedPincode = pincode.trim();
    const trimmedAddress = address.trim();
    const trimmedCity = city.trim();
    const trimmedStateName = stateName.trim();

    // Collect missing fields
    const missingFields = [];
    if (!trimmedFullName) missingFields.push("Full Name");
    if (!trimmedPhone) missingFields.push("Phone Number");
    if (!trimmedPincode) missingFields.push("Pincode");
    if (!trimmedAddress) missingFields.push("Address");
    if (!trimmedCity) missingFields.push("City");
    if (!trimmedStateName) missingFields.push("State");

    if (missingFields.length > 0) {
      showPopup(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    const phoneRegex = /^[0-9]{5,15}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      showPopup("Please enter a valid mobile number (5-15 digits).");
      return;
    }

    const fullPhone = `${countryCode}${trimmedPhone}`;

    const pincodeRegex = /^[0-9]{5,6}$/;
    if (!pincodeRegex.test(trimmedPincode)) {
      showPopup("Please enter a valid 5 or 6-digit pincode.");
      return;
    }

    const addressInfo = {
      fullName: trimmedFullName,
      phone: fullPhone,
      pincode: trimmedPincode,
      address: trimmedAddress,
      city: trimmedCity,
      state: trimmedStateName,
    };

    navigate("/payment", { state: { ...state, addressInfo } });
  };

  return (
    <div className="checkout-page">
      <h1>Checkout 🛒</h1>

      {/* Address Section */}
      <div className="address-section">
        <h2>Delivery Address</h2>
        <div className="address-form">
          <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <div className="phone-input">
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              <option value="+1">🇺🇸 +1</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+61">🇦🇺 +61</option>
            </select>
            <input type="text" placeholder="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <input type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
          <input type="text" placeholder="Flat, House No., Building, Company" value={address} onChange={(e) => setAddress(e.target.value)} />
          <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <input type="text" placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} />
        </div>
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        {state.product && state.quantity && (
          <div className="order-item">
            <p>{state.product.title} x {state.quantity}</p>
            <p>Total: 💲{(state.product.price * state.quantity).toFixed(2)}</p>
          </div>
        )}
        {state.cart && (
          <div className="order-list">
            {state.cart.map((item) => (
              <div key={item.id} className="order-cart-item">
                <p>{item.title} x {item.quantity}</p>
                <p>Subtotal: 💲{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <hr />
            <h4>Total Amount: 💲{state.totalPrice?.toFixed(2)}</h4>
          </div>
        )}
      </div>

      <button className="checkout-btn" onClick={handleNext}>
        Continue to Payment
      </button>

      {/* Popup */}
      {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />}
    </div>
  );
};

export default CheckoutPage;
