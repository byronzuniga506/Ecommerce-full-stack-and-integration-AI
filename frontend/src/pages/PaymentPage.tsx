import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Popup from "../popup/Missinginfo"; 
import "../index.css"; 

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface LocationState {
  product?: Product;
  quantity?: number;
  cart?: CartItem[];
  totalPrice?: number;
  addressInfo?: {
    fullName: string;
    phone: string;
    pincode: string;
    address: string;
    city: string;
    state: string;
  };
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const addressInfo = state?.addressInfo;

  if (!state || (!state.product && (!state.cart || state.cart.length === 0)) || !addressInfo) {
    return <p>Order details not found!</p>;
  }

  const isSingleProduct = !!state.product;
  const items: CartItem[] = isSingleProduct
    ? [{ ...(state.product as Product), quantity: state.quantity || 1 }]
    : (state.cart as CartItem[]);

  const totalPrice = isSingleProduct
    ? (state.product!.price * (state.quantity || 1))
    : state.totalPrice || items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  // Payment inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  // Popup
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const showPopup = (msg: string) => setPopupMessage(msg);

  const handlePlaceOrder = () => {
    if (paymentMethod === "Credit Card" || paymentMethod === "Debit Card") {
      const missing = [];
      if (!cardNumber) missing.push("Card Number");
      if (!cardName) missing.push("Name on Card");
      if (!expiry) missing.push("Expiry (MM/YY)");
      if (!cvv) missing.push("CVV");

      if (missing.length > 0) {
        showPopup(`Please fill in: ${missing.join(", ")}`);
        return;
      }
    } else if (paymentMethod === "UPI") {
      if (!upiId) {
        showPopup("Please enter your UPI ID.");
        return;
      }
    }

    // All good → navigate
    navigate("/confirmation", {
      state: {
        items,
        totalPrice,
        paymentMethod,
        addressInfo,
        cardDetails: { cardNumber, cardName, expiry, cvv },
        upiId,
      },
    });
  };

  return (
    <div className="payment-page">
      <h1>💳 Payment</h1>

      {/* Delivery Address */}
      <div className="payment-address">
        <h3>Delivery Address:</h3>
        <div className="address-box">
          <p><strong>{addressInfo.fullName}</strong></p>
          <p>{addressInfo.address}, {addressInfo.city}, {addressInfo.state}, {addressInfo.pincode}</p>
          <p>📞 {addressInfo.phone}</p>
        </div>
      </div>

      {/* Payment Section */}
      <div className="payment-section">
        <h3>Select Payment Method:</h3>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="UPI">UPI</option>
          <option value="Cash on Delivery">Cash on Delivery</option>
        </select>

        {/* Dynamic Payment Inputs */}
        {(paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && (
          <div className="payment-form">
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder="Name on Card"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
            <div className="row">
              <input
                type="text"
                placeholder="Expiry (MM/YY)"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
              <input
                type="password"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>
        )}

        {paymentMethod === "UPI" && (
          <div className="payment-form">
            <input
              type="text"
              placeholder="Enter your UPI ID"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        {items.map((item) => (
          <p key={item.id}>
            {item.title} × {item.quantity} = 💲{(item.price * item.quantity).toFixed(2)}
          </p>
        ))}
        <hr />
        <p className="total">Total: 💲{totalPrice.toFixed(2)}</p>
      </div>

      <button className="checkout-btn" onClick={handlePlaceOrder}>
        Place Order
      </button>

      {/* Popup */}
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
      )}
    </div>
  );
};

export default PaymentPage;
