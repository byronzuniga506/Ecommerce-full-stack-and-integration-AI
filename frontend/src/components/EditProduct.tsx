import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import "../index.css";
import API_URL from "../config";

type ProductFormInputs = {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState("");
  const [sellerName, setSellerName] = useState("");
  
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormInputs>();
  const imageUrl = watch("image");

  useEffect(() => {
    const name = localStorage.getItem("sellerName");
    setSellerName(name || "Seller");
    
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  useEffect(() => {
    if (imageUrl && imageUrl.trim() !== "") {
      setImagePreview(imageUrl);
    }
  }, [imageUrl]);

  const fetchProduct = async (productId: string) => {
    try {
      const res = await fetch(`${API_URL}/products/${productId}`);
      const product = await res.json();
      
      if (res.ok) {
        setValue("title", product.title);
        setValue("price", product.price);
        setValue("description", product.description);
        setValue("category", product.category);
        setValue("image", product.image);
        setImagePreview(product.image);
      } else {
        setPopupMessage(' Failed to load product!');
        setPopupType('error');
        setPopupVisible(true);
        setTimeout(() => {
          navigate("/seller-dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setPopupMessage(' Failed to load product!');
      setPopupType('error');
      setPopupVisible(true);
      setTimeout(() => {
        navigate("/seller-dashboard");
      }, 2000);
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      const res = await fetch(`${API_URL}/products/${id}`,{
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setPopupMessage(' Product updated successfully!');
        setPopupType('success');
        setPopupVisible(true);
        setTimeout(() => {
          navigate("/seller-dashboard");
        }, 2000);
      } else {
        setPopupMessage('❌ ' + result.error);
        setPopupType('error');
        setPopupVisible(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setPopupMessage(' Failed to update product!');
      setPopupType('error');
      setPopupVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  if (fetching) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', fontSize: '18px' }}>Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-product-container">
      {popupVisible && (
        <div className="popup-modal" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: popupType === 'success' ? '#28a745' : '#dc3545',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          minWidth: '300px',
          textAlign: 'center',
        }}>
          <p>{popupMessage}</p>
          <button onClick={closePopup} style={{
            padding: '8px 16px',
            border: 'none',
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            Close
          </button>
        </div>
      )}

      <div className="add-product-wrapper">
        <div className="seller-header">
          <div className="seller-info">
            <div className="seller-avatar">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="seller-welcome">Edit Product ✏️</h2>
              <p className="seller-subtitle">Update product details</p>
            </div>
          </div>
          <div className="seller-header-buttons">
            <button 
              className="logout-btn" 
              onClick={() => navigate("/seller-dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className="product-form-card">
          <div className="form-header">
            <div className="form-icon">✏️</div>
            <h1 className="form-title">Edit Product</h1>
            <p className="form-subtitle">Update the details below and save changes</p>
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
              {errors.title && <span className="error-message">{errors.title.message}</span>}
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
              {errors.price && <span className="error-message">{errors.price.message}</span>}
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
              {errors.description && <span className="error-message">{errors.description.message}</span>}
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
              {errors.category && <span className="error-message">{errors.category.message}</span>}
            </div>

            {/* Image URL OR Upload */}
            <div className="form-group">
              <label>Product Image (Optional)</label>
              <input
                type="text"
                placeholder="Paste image URL here"
                {...register("image")}
              />
              <div style={{ textAlign: 'center', margin: '10px 0', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                OR
              </div>
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

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>💾 Save Changes</>
                )}
              </button>

              <button
                type="button"
                className="view-products-btn"
                onClick={() => navigate("/seller-dashboard")}
                style={{ flex: 1 }}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;