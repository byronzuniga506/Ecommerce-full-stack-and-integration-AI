import React, { useState } from "react";
import "../index.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

const ForgotPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ Auto-detect if seller or customer based on URL
  const isSeller = location.pathname.includes("seller");
  const userType = isSeller ? "seller" : "customer";
  const loginRoute = isSeller ? "/seller-login" : "/login";
  const pageTitle = isSeller ? "🔐 Seller - Reset Password" : "🔐 Reset Password";

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/forgot-password/send-otp`, { 
        email, 
        userType // ✅ Pass userType to backend
      });
      setMessage(res.data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/forgot-password/verify-otp`, { 
        email, 
        otp,
        userType // ✅ Pass userType
      });
      setMessage(res.data.message);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/forgot-password/reset`, {
        email,
        otp,
        newPassword,
        userType // ✅ Pass userType
      });
      setMessage(res.data.message);
      
      setTimeout(() => {
        navigate(loginRoute); // ✅ Go to correct login page
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>{pageTitle}</h2>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`Enter your registered ${userType} email`}
                required
              />
            </div>

            {message && <p style={{ color: "green", fontSize: "14px" }}>✅ {message}</p>}
            {error && <p style={{ color: "red", fontSize: "14px" }}>❌ {error}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <p className="login-link">
              Remember your password? <a href={loginRoute}>Login</a>
            </p>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p style={{ marginBottom: "20px", color: "#666", fontSize: "14px" }}>
              📧 OTP sent to <strong>{email}</strong>
            </p>

            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>

            {message && <p style={{ color: "green", fontSize: "14px" }}>✅ {message}</p>}
            {error && <p style={{ color: "red", fontSize: "14px" }}>❌ {error}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="login-link">
              <a href="#" onClick={() => setStep(1)}>← Back to email</a>
            </p>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p style={{ marginBottom: "20px", color: "green", fontSize: "14px" }}>
              ✅ OTP Verified! Enter your new password
            </p>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>

            {message && <p style={{ color: "green", fontSize: "14px" }}>✅ {message}</p>}
            {error && <p style={{ color: "red", fontSize: "14px" }}>❌ {error}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;