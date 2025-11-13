import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveOrder, sendOrderEmail } from "../Api/orderApi";
import "../index.css";
import Popup from "../popup/OrderConfirmationPagepopup";

interface ProductItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface AddressInfo {
  fullName: string;
  phone: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
}

interface LocationState {
  items: ProductItem[];
  totalPrice: number;
  paymentMethod: string;
  addressInfo: AddressInfo;
}

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  if (!state || !state.items) return <p>Order details not found!</p>;

  const { fullName, phone, address, city, state: stateName, pincode } = state.addressInfo;

  const handleClose = async () => {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
      setPopupMessage("No registered email found. Please log in again.");
      setShowPopup(true);
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      //  Step 1: Save order in DB
      const saveRes = await saveOrder(
        userEmail,
        fullName,
        state.items,
        state.totalPrice,
        { fullName, phone, address, city, state: stateName, pincode }
      );
      console.log(" Order saved:", saveRes);

      //  Step 2: Send order confirmation email
      const emailRes = await sendOrderEmail(
        userEmail,
        fullName,
        state.items,
        state.totalPrice,
        { fullName, phone, address, city, state: stateName, pincode }
      );
      console.log(" Email sent:", emailRes);

      //  Show success popup
      setPopupMessage(" Order placed successfully! Confirmation email sent.");
      setShowPopup(true);
    } catch (error: any) {
      console.error(" Order processing failed:", error);
      setPopupMessage(" Something went wrong while placing your order.");
      setShowPopup(true);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h1>Order Confirmed </h1>

            <div className="order-items">
              {state.items.map((item) => (
                <div key={item.id} className="order-item">
                  <span>{item.quantity} x {item.title}</span>
                  <span>💲{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <p className="total">Total Cost: 💲{state.totalPrice.toFixed(2)}</p>

            <div className="info">
              <p><strong>Delivering to:</strong></p>
              <p>{fullName}</p>
              <p>{address}, {city}, {stateName} - {pincode}</p>
              <p>{phone}</p>
            </div>

            <p className="info"><strong>Payment Method:</strong> {state.paymentMethod}</p>
            <h3>Thank you for shopping!</h3>

            <button className="close-btn" onClick={handleClose} disabled={loading}>
              {loading ? "Processing..." : "Close"}
            </button>
          </div>
        </div>
      )}

      {/*  Popup Component */}
      {showPopup && (
        <Popup
          message={popupMessage}
          onClose={() => {
            setShowPopup(false);
            navigate("/products"); // redirect after closing popup
          }}
        />
      )}
    </>
  );
};

export default OrderConfirmationPage;
