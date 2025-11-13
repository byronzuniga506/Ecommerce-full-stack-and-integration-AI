import React, { useState, useEffect } from "react";
import "../index.css";
import { sendOtp, verifyOtp, sellerSignup} from "../Api/OtpApi";
import SignupPopup from "../popup/SignupPopup";

const SellerSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    description: "",
    otp: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    description: "",
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

  //  Helper function to extract error message
  const getErrorMessage = (error: any): string => {
  //  First check if error is the response.data object directly
  if (error?.error) {
    return error.error;
  }
  
  //  Check for message property (from fallback)
  if (error?.message) {
    return error.message;
  }
  
  //  For nested axios errors (just in case)
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  //  Last resort - convert to string
  return String(error);
};

  // Load saved form data
  useEffect(() => {
    const savedData = localStorage.getItem("sellerSignupForm");
    if (savedData) setFormData(JSON.parse(savedData));
  }, []);

  // Save form data persistently
  useEffect(() => {
    localStorage.setItem("sellerSignupForm", JSON.stringify(formData));
  }, [formData]);

  // Real-time validation functions
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "name":
        return value.trim() ? "" : "Full name required.";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email.";
      case "password":
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value)
          ? ""
          : "Password must have uppercase, lowercase, number & special character.";
      case "storeName":
        return value.trim() ? "" : "Store name required.";
      case "description":
        return value.trim() ? "" : "Description required.";
      case "otp":
        return value.trim() ? "" : "OTP required.";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleSendOtp = async () => {
    // Validate required fields first
    const requiredFields = ["name", "storeName", "email", "description", "password"];
    let valid = true;
    const newErrors = { ...errors };

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) valid = false;
      newErrors[field as keyof typeof errors] = error;
    });

    setErrors(newErrors);
    if (!valid) return;

    setLoading(true);
    try {
      await sendOtp(formData.email);
      setOtpSent(true);
      openPopup(`OTP sent to ${formData.email}`);
    } catch (error: any) {
      openPopup(getErrorMessage(error)); 
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpError = validateField("otp", formData.otp);
    if (otpError) {
      setErrors({ ...errors, otp: otpError });
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(formData.email, formData.otp);
      setOtpVerified(true);
      setErrors({ ...errors, otp: "" });
      openPopup("OTP verified successfully!");
    } catch (error: any) {
      setOtpVerified(false);
      const errorMsg = getErrorMessage(error); 
      setErrors({ ...errors, otp: errorMsg });
      openPopup(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      setErrors({ ...errors, otp: "Please verify OTP before signup." });
      return;
    }

    setLoading(true);
    try {
      const res = await sellerSignup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        storeName: formData.storeName,
        store_description: formData.description,
      });
      
      // Extract message from response
      const successMessage = res?.data?.message || "Signup successful! Await approval.";
      openPopup(successMessage);
      
      localStorage.removeItem("sellerSignupForm");
      setFormData({ name: "", email: "", password: "", storeName: "", description: "", otp: "" });
      setOtpSent(false);
      setOtpVerified(false);
    } catch (error: any) {
      openPopup(getErrorMessage(error)); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Seller Signup</h2>
        <form onSubmit={handleSubmit}>
          {["name", "storeName", "description", "password", "email"].map((field) => (
            <div className="form-group" key={field}>
              <label>{field === "name" ? "Full Name" : field === "storeName" ? "Store Name" : field === "description" ? "Store Description" : field === "password" ? "Password" : "Email"}</label>
              {field === "description" ? (
                <textarea
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  rows={3}
                  placeholder={field === "description" ? "What do you sell?" : ""}
                  style={{width:"100%" }}
                />
              ) : (
                <input
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={`Enter ${field}`}
                  disabled={field === "email" && otpVerified}
                  autoComplete="new-password"
                />
              )}
              {errors[field as keyof typeof errors] && <p className="error-message">{errors[field as keyof typeof errors]}</p>}
              {field === "email" && (
                <button type="button" onClick={handleSendOtp} disabled={loading || otpVerified}>
                  {loading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                </button>
              )}
            </div>
          ))}

          {otpSent && !otpVerified && (
            <div className="form-group">
              <label>OTP</label>
              <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="Enter OTP" />
              {errors.otp && <p className="error-message">{errors.otp}</p>}
              <button type="button" onClick={handleVerifyOtp} disabled={loading || !formData.otp}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          <button type="submit" className="signup-btn" disabled={loading || !otpVerified}>
            {loading ? "Submitting..." : "Sign Up"}
          </button>
        </form>

        <p className="login-link">
          Already a seller? <a href="/seller-login">Login</a>
        </p>
      </div>

      {showPopup && <SignupPopup message={popupMessage} onClose={closePopup} />}
    </div>
  );
};

export default SellerSignup;