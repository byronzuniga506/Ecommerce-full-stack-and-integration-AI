import React, { useState } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import LoginPopup from "../popup/Loginpopup";
import { sellerLogin } from "../Api/SellerApi";

const SellerLogin: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setPopupMessage("Please enter both email and password");
      setShowPopup(true);
      return;
    }

    setLoading(true);
    try {
      const res = await sellerLogin(formData);
      
      // SAVE ALL DATA TO LOCALSTORAGE
      localStorage.setItem("sellerEmail", formData.email);
      localStorage.setItem("sellerName", res.data.name);
      localStorage.setItem("sellerStatus", res.data.status);
      
      setPopupMessage(res.data.message);
      setShowPopup(true);
      
      setTimeout(() => {
        navigate("/add-product");
      }, 1500);
      
    } catch (err: any) {
      const errorData = err.response?.data;
      
      if (err.response?.status === 403) {
        setPopupMessage(errorData?.error || "Your account is not approved yet.");
      } else if (err.response?.status === 401) {
        setPopupMessage("Invalid email or password");
      } else {
        setPopupMessage(errorData?.error || "Login failed. Please try again.");
      }
      
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage("");
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Seller Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your registered email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* ✅ ADD FORGOT PASSWORD LINK */}
          <p className="forgot-password-link" style={{ textAlign: "right", marginTop: "-10px", marginBottom: "15px" }}>
            <a href="/seller-forgot-password" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px" }}>
              Forgot Password?
            </a>
          </p>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* View Products Button */}
          <button
            type="button"
            className="view-products-btn"
            onClick={() => navigate("/products")}
          >
            🛍️ Browse Products
          </button>

          <p className="login-link">
            Don't have a seller account? <a href="/seller-signup">Signup</a>
          </p>
        </form>
      </div>
      {showPopup && <LoginPopup message={popupMessage} onClose={closePopup} />}
    </div>
  );
};

export default SellerLogin;