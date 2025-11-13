import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import LogoutPopup from "../popup/LogoutPopup"; 

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  // Handle the logout process
  useEffect(() => {
    // Clear session storage or local storage
    localStorage.removeItem("userEmail");
    localStorage.removeItem("authToken");

    // Show the popup after clearing the session
    setShowPopup(true);

    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigate("/login");
    }, 3000); // Redirects after 3 seconds
  }, [navigate]);

  return (
    <div className="logout-container">
      <h2>Logging out...</h2>
      {showPopup && <LogoutPopup message="Successfully logged out!" onClose={() => setShowPopup(false)} />}
      <p>We are redirecting you to the login page...</p>
    </div>
  );
};

export default Logout;
