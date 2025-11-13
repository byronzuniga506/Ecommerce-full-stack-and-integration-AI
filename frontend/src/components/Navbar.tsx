import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import "../index.css";

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchTerm, onSearchChange }) => {
  const navigate = useNavigate();

  const handleMyOrders = () => {
  navigate("/my-orders");
};
  // Confirm dialog states
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  // Show confirm dialog helper
  const showConfirm = (message: string, callback: () => void) => {
    setConfirmMessage(message);
    setConfirmCallback(() => callback);
    setConfirmVisible(true);
  };

  // Handle confirm button click
  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    setConfirmVisible(false);
    setConfirmCallback(null);
  };

  // Handle cancel button click
  const handleCancel = () => {
    setConfirmVisible(false);
    setConfirmCallback(null);
  };

  // Now shows confirmation dialog before logout
  const handleLogout = () => {
    showConfirm(
      "Are you sure you want to logout?",
      () => {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        navigate("/logout");
      }
    );
  };

  const handleCart = () => {
    navigate("/cart");
  };

  const handleBecomeSeller = () => {
    navigate("/seller-login");
  };

  const handleContact = () => {
    navigate("/contactus");
  };

  return (
    <>
      {/*Confirm Dialog Modal */}
      {confirmVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px 40px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            minWidth: '400px',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
            <p style={{ 
              margin: '0 0 30px 0', 
              fontSize: '16px', 
              color: '#333', 
              whiteSpace: 'pre-line' 
            }}>
              {confirmMessage}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleCancel} style={{
                padding: '10px 24px',
                border: '2px solid #ddd',
                backgroundColor: '#fff',
                color: '#333',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Cancel
              </button>
              <button onClick={handleConfirm} style={{
                padding: '10px 24px',
                border: 'none',
                backgroundColor: '#dc3545',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Original Navbar - NO CHANGES BELOW */}
      <div className="navbar">
        <div className="navbar-logo">🛒 MyStore</div>

        <input
          className="navbar-search"
          type="text"
          placeholder="Search for Products, Brands and More"
          value={searchTerm}
          onChange={onSearchChange}
        />

        <div className="navbar-links">
          <button onClick={handleLogout}>Logout</button>
          <button onClick={handleCart}>Cart</button>
          <button onClick={handleBecomeSeller}>Become a Seller</button>
          <button onClick={handleContact}>Contact Us</button>
          <button onClick={handleMyOrders}>My Orders</button>
        </div>
      </div>
    </>
  );
};

export default Navbar;