import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "../index.css";

type ProductFormInputs = {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [sellerName, setSellerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Popup states
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('info');

  // Confirm dialog states
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductFormInputs>();

  const imageUrl = watch("image");

  useEffect(() => {
    const name = localStorage.getItem("sellerName");
    setSellerName(name || "Seller");
  }, []);

  useEffect(() => {
    if (imageUrl && imageUrl.trim() !== "") {
      setImagePreview(imageUrl);
    } else {
      setImagePreview("");
    }
  }, [imageUrl]);

  // Show popup helper
  const showPopup = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
  };

  // Show confirm dialog helper
  const showConfirm = (message: string, callback: () => void) => {
    setConfirmMessage(message);
    setConfirmCallback(() => callback);
    setConfirmVisible(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setValue("image", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<ProductFormInputs> = async (data) => {
    setLoading(true);
    
    try {
      const productData = {
        ...data,
        image: data.image || "https://via.placeholder.com/300x300?text=No+Image",
        sellerId: localStorage.getItem("sellerEmail"),
        sellerName: localStorage.getItem("sellerName"),
        rating: {
          rate: 0,
          count: 0
        }
      };

      const res = await fetch("http://localhost:5000/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await res.json();
      
      if (res.ok) {
        showPopup(" Product added successfully! Check your email for confirmation. 📧", "success");
        reset();
        setImagePreview("");
        setUploadedFile(null);
      } else {
        showPopup(" " + result.error, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showPopup("❌ Failed to add product! Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    showConfirm("Are you sure you want to logout?", () => {
      localStorage.removeItem("sellerEmail");
      localStorage.removeItem("sellerName");
      navigate("/seller-login");
    });
  };

  // Close popup
  const closePopup = () => {
    setPopupVisible(false);
  };

  // Handle confirm
  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    setConfirmVisible(false);
    setConfirmCallback(null);
  };

  // Handle cancel
  const handleCancel = () => {
    setConfirmVisible(false);
    setConfirmCallback(null);
  };

  return (
    <div className="add-product-container">
      {/* Popup Modal */}
      {popupVisible && (
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
            backgroundColor: popupType === 'success' ? '#28a745' : popupType === 'error' ? '#dc3545' : '#17a2b8',
            color: 'white',
            padding: '30px 40px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            minWidth: '350px',
            maxWidth: '500px'
          }}>
            <p style={{ margin: '0 0 20px 0', fontSize: '16px', whiteSpace: 'pre-line' }}>{popupMessage}</p>
            <button onClick={closePopup} style={{
              padding: '10px 24px',
              border: 'none',
              backgroundColor: '#fff',
              color: '#000',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
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
            <p style={{ margin: '0 0 30px 0', fontSize: '16px', color: '#333', whiteSpace: 'pre-line' }}>
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

      <div className="add-product-wrapper">
        <div className="seller-header">
          <div className="seller-info">
            <div className="seller-avatar">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="seller-welcome">Welcome, {sellerName}! 👋</h2>
              <p className="seller-subtitle">Seller Dashboard</p>
            </div>
          </div>
          <button 
            className="dashboard-btn" 
            onClick={() => navigate("/seller-dashboard")}
          >
            Dashboard
          </button>
          <div className="seller-header-buttons">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="product-form-card">
          <div className="form-header">
            <div className="form-icon">🛒</div>
            <h1 className="form-title">Add New Product</h1>
            <p className="form-subtitle">
              Fill in the details below to add a new product to your store
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="product-form">
            {/* Product Title */}
            <div className="form-group">
              <label>Product Title *</label>
              <input
                type="text"
                placeholder="Enter product title"
                {...register("title", { 
                  required: "Title is required",
                  minLength: { value: 3, message: "Title must be at least 3 characters" }
                })}
                className={errors.title ? "error" : ""}
              />
              {errors.title && (
                <span className="error-message">{errors.title.message}</span>
              )}
            </div>

            {/* Price */}
            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("price", { 
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                  valueAsNumber: true 
                })}
                className={errors.price ? "error" : ""}
              />
              {errors.price && (
                <span className="error-message">{errors.price.message}</span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description *</label>
              <textarea
                rows={4}
                placeholder="Describe your product..."
                {...register("description", { 
                  required: "Description is required",
                  minLength: { value: 10, message: "Description must be at least 10 characters" }
                })}
                className={errors.description ? "error" : ""}
              />
              {errors.description && (
                <span className="error-message">{errors.description.message}</span>
              )}
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category *</label>
              <select
                {...register("category", { required: "Category is required" })}
                className={errors.category ? "error" : ""}
              >
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="jewelery">Jewelery</option>
                <option value="men's clothing">Men's Clothing</option>
                <option value="women's clothing">Women's Clothing</option>
                <option value="books">Books</option>
                <option value="toys">Toys</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
              </select>
              {errors.category && (
                <span className="error-message">{errors.category.message}</span>
              )}
            </div>

            {/* Image URL OR Upload */}
            <div className="form-group">
              <label>Product Image (Optional)</label>
              
              <input
                type="text"
                placeholder="Paste image URL here (e.g., from Unsplash, Imgur, etc.)"
                {...register("image")}
                className={errors.image ? "error" : ""}
              />
              
              {errors.image && (
                <span className="error-message">{errors.image.message}</span>
              )}
              
              <div style={{ textAlign: 'center', margin: '10px 0', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                OR
              </div>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ 
                    padding: '10px',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    backgroundColor: '#f9f9f9'
                  }}
                />
              </div>
              
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
                💡 Paste a URL or upload an image file. If left empty, a placeholder will be used.
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="image-preview-container">
                <label>Image Preview:</label>
                <div className="image-preview" style={{
                  marginTop: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Product preview" 
                    style={{
                      maxWidth: '300px',
                      maxHeight: '300px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Invalid+Image';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Adding Product...
                </>
              ) : (
                <>➕ Add Product</>
              )}
            </button>

            {/* View Products Button Below Submit */}
            <button
              type="button"
              className="view-products-btn"
              onClick={() => navigate("/products")}
            >
              📦 View All Products
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;