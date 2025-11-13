import React from "react";
import "../index.css";

interface SignupPopupProps {
  message: string;
  onClose: () => void;
}

// Make sure you define props here
const SignupPopup: React.FC<SignupPopupProps> = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SignupPopup;
