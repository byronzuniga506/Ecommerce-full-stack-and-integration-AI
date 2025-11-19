import React, { useState } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import LoginPopup from "../popup/Loginpopup";
import { loginUser } from "../Api/LoginApi";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginUser(formData);

      // Store the logged-in user's email for later use (e.g., sending order emails)
      localStorage.setItem("userEmail", formData.email);

      setPopupMessage(res.data.message);

      if (res.status === 200) {
        navigate("/products");
      }
    } catch (err: any) {
      setPopupMessage(err.response?.data?.error || "Login failed");
    } finally {
      setShowPopup(true);
    }
  };

  const closePopup = () => setShowPopup(false);

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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
            />
          </div>
          <button type="submit" className="login-btn">
            Login
          </button>

          <p className="login-link">
  Don't have an account? <a href="/signup">Signup</a>
</p>
<p className="login-link">
  <a href="/forgot-password">Forgot Password?</a>
</p>
        </form>
      </div>

      {showPopup && <LoginPopup message={popupMessage} onClose={closePopup} />}
    </div>
  );
};

export default Login;
