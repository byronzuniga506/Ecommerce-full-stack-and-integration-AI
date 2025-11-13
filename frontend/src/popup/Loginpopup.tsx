import React from "react";
import "../index.css";

//  Rename the interface to have "Props" at the end
interface LoginPopupProps {
  message: string;
  onClose: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3 className="popup-title">Login Status</h3>
        <p className="popup-message">{message}</p>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
