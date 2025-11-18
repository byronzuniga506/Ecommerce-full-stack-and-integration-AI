import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import API_URL from "../config";

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/contact-us`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Contact form error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-us-container">
      <div className="contact-us-card">
        <h1>📧 Contact Us</h1>
        <p className="contact-subtitle">
          Have questions? We'd love to hear from you!
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What is this regarding?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Type your message here..."
              rows={6}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
          <button type = "button" onClick={() => navigate("/products")} >Cancel</button>
        </form>

        <div className="contact-info">
          <h3>Other Ways to Reach Us</h3>
          <p>📧 Email: support@mystore.com</p>
          <p>📞 Phone: +91 9949701247</p>
          <p>🕐 Hours: Mon-Fri, 9 AM - 6 PM EST</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;