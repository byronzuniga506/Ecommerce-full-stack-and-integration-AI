import React from "react";

interface LogoutPopupProps {
  message: string;
  onClose: () => void;
}

const LogoutPopup: React.FC<LogoutPopupProps> = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>{message}</h3>
        <button onClick={onClose} className="popup-close-btn">Close</button>
      </div>
    </div>
  );
};

export default LogoutPopup;
