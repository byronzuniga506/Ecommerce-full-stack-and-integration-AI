import React, { useState, useEffect } from "react";
import "../index.css";
import { sendOtp, verifyOtp, signupUser } from "../Api/OtpApi";
import SignupPopup from "../popup/SignupPopup";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = (message: string) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  const closePopup = () => {
    setPopupMessage("");
    setShowPopup(false);
  };

  // Load saved form data on refresh
  useEffect(() => {
    const savedData = localStorage.getItem("signupForm");
    if (savedData) setFormData(JSON.parse(savedData));
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("signupForm", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation functions
  const isValidName = (name: string) => /^[a-zA-Z ]+$/.test(name.trim());
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

  // Send OTP
  const handleSendOtp = async () => {
  let valid = true;
  const newErrors = { name: "", email: "", password: "", otp: "" };

  if (!formData.name.trim()) {
    newErrors.name = "Please enter your full name.";
    valid = false;
  } else if (!isValidName(formData.name)) {
    newErrors.name = "Name can only contain letters and spaces.";
    valid = false;
  }

  if (!formData.email.trim()) {
    newErrors.email = "Please enter your email.";
    valid = false;
  } else if (!isValidEmail(formData.email)) {
    newErrors.email = "Please enter a valid email address.";
    valid = false;
  }

  if (!formData.password) {
    newErrors.password = "Please enter your password.";
    valid = false;
  } else if (!isValidPassword(formData.password)) {
    newErrors.password =
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
    valid = false;
  }

  setErrors(newErrors);
  if (!valid) return;

  setLoading(true);
  try {
    await sendOtp(formData.email);
    setOtpSent(true);
    setOtpVerified(false);
    setErrors({ ...newErrors, otp: "" });

    // NEW LINE: show popup success message
    openPopup(`OTP has been sent to ${formData.email}`);
  } catch (error: any) {
    setErrors({ ...newErrors, otp: "Failed to send OTP." });
  } finally {
    setLoading(false);
  }
};

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) {
      setErrors({ ...errors, otp: "OTP is required." });
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(formData.email, formData.otp);
      setOtpVerified(true);
      setErrors({ ...errors, otp: "" });
    } catch (error: any) {
      setOtpVerified(false);
      setErrors({ ...errors, otp: error.message || "Invalid OTP." });
    } finally {
      setLoading(false);
    }
  };

  // Signup user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    const newErrors = { name: "", email: "", password: "", otp: "" };

    if (!isValidName(formData.name)) {
      newErrors.name = "Name can only contain letters and spaces.";
      valid = false;
    }
    if (!isValidEmail(formData.email)) {
      newErrors.email = "Enter a valid email address.";
      valid = false;
    }
    if (!isValidPassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
      valid = false;
    }
    if (!otpVerified) {
      newErrors.otp = "Please verify OTP before signup.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    setLoading(true);
    try {
      const res = await signupUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      openPopup(res.message || "Signup successful!");
      setFormData({ name: "", email: "", password: "", otp: "" });
      setOtpSent(false);
      setOtpVerified(false);
      localStorage.removeItem("signupForm");
      setErrors({ name: "", email: "", password: "", otp: "" });
    } catch (error: any) {
      openPopup(error.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          {/* Email + Send OTP */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={otpVerified}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
            <button
              type="button"
              className="otp-btn"
              onClick={handleSendOtp}
              disabled={loading || otpVerified}
            >
              {loading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
            </button>
          </div>

          {/* OTP input + Verify */}
          {otpSent && !otpVerified && (
            <div className="form-group">
              <label>OTP</label>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP sent to your email"
                value={formData.otp}
                onChange={handleChange}
              />
              {errors.otp && <p className="error-message">{errors.otp}</p>}
              <button
                type="button"
                className="verify-btn"
                onClick={handleVerifyOtp}
                disabled={loading || !formData.otp}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          {/* Signup button */}
          <button
            type="submit"
            className="signup-btn"
            disabled={loading || !otpVerified}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>

      {showPopup && <SignupPopup message={popupMessage} onClose={closePopup} />}
    </div>
  );
};

export default Signup;
