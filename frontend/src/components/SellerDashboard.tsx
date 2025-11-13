import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Sellerdashboard.css"; 

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  sellerId: string;
  sellerName: string;
  status: "draft" | "published";
  createdAt: string;
  rating: {
    rate: number;
    count: number;
  };
}

interface Activity {
  id: number;
  product_id: number;
  action: string;
  product_title: string;
  timestamp: string;
}

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  // Popup states
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('info');

  // Confirm dialog states
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    verifySellerAccess();
  }, []);

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

  // FETCH RECENT ACTIVITY
  const fetchRecentActivity = async (email: string) => {
    try {
      const res = await fetch(`http://localhost:5000/seller-activity?sellerId=${email}`);
      const data = await res.json();
      
      if (res.ok) {
        setRecentActivity(data);
        console.log(" Loaded activity:", data);
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  //  VERIFY SELLER IS LOGGED IN AND APPROVED
  const verifySellerAccess = async () => {
    const email = localStorage.getItem("sellerEmail");
    const name = localStorage.getItem("sellerName");
    const status = localStorage.getItem("sellerStatus");

    //  Not logged in
    if (!email) {
      showPopup("⚠️ Please login first!", "error");
      setTimeout(() => navigate("/seller-login"), 2000);
      return;
    }

    //  Not approved
    if (status !== "approved") {
      showPopup("⚠️ Your account is not approved yet. Only approved sellers can access the dashboard.", "error");
      localStorage.removeItem("sellerEmail");
      localStorage.removeItem("sellerName");
      localStorage.removeItem("sellerStatus");
      setTimeout(() => navigate("/seller-login"), 2000);
      return;
    }

    //  Verify with backend (optional extra security)
    try {
      const response = await fetch("http://localhost:5000/check-seller-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.isApproved) {
        showPopup("⚠️ Your seller account is not approved. Please wait for admin approval.", "error");
        localStorage.removeItem("sellerEmail");
        localStorage.removeItem("sellerName");
        localStorage.removeItem("sellerStatus");
        setTimeout(() => navigate("/seller-login"), 2000);
        return;
      }

      //  All checks passed
      setSellerEmail(email);
      setSellerName(name || "Seller");
      setIsVerifying(false);
      fetchMyProducts(email);
      fetchRecentActivity(email);

    } catch (error) {
      console.error("Error verifying seller:", error);
      showPopup(" Failed to verify seller status. Please login again.", "error");
      setTimeout(() => navigate("/seller-login"), 2000);
    }
  };

  // FETCH SELLER'S PRODUCTS
  const fetchMyProducts = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/seller-products?sellerId=${email}`);
      const data = await res.json();
      
      if (res.ok) {
        setProducts(data);
        console.log(" Loaded products:", data);
      } else {
        console.error("Failed to load products:", data.error);
        showPopup(" Failed to load products: " + (data.error || "Unknown error"), "error");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showPopup("Failed to load products!", "error");
    } finally {
      setLoading(false);
    }
  };

  //  LOGOUT
  const handleLogout = () => {
    showConfirm("Are you sure you want to logout?", () => {
      localStorage.removeItem("sellerEmail");
      localStorage.removeItem("sellerName");
      localStorage.removeItem("sellerStatus");
      navigate("/seller-login");
    });
  };

  //  DELETE PRODUCT
  const handleDelete = async (id: number, title: string) => {
    showConfirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone!`,
      async () => {
        try {
          const res = await fetch(`http://localhost:5000/products/${id}`, {
            method: "DELETE",
          });

          const result = await res.json();

          if (res.ok) {
            showPopup(" Product deleted successfully! Check your email for confirmation.", "success");
            fetchMyProducts(sellerEmail);
            fetchRecentActivity(sellerEmail);
          } else {
            showPopup("❌ " + (result.error || "Failed to delete product"), "error");
          }
        } catch (error) {
          console.error("Error:", error);
          showPopup("❌ Failed to delete product!", "error");
        }
      }
    );
  };

  //  PUBLISH PRODUCT
  const handlePublish = async (id: number, title: string) => {
    showConfirm(
      `Publish "${title}"?\n\nThis will make it visible to customers on the store.`,
      async () => {
        try {
          const res = await fetch(`http://localhost:5000/products/${id}/publish`, {
            method: "PATCH",
          });

          const result = await res.json();

          if (res.ok) {
            showPopup(" Product published successfully! Check your email for confirmation.", "success");
            fetchMyProducts(sellerEmail);
            fetchRecentActivity(sellerEmail);
          } else {
            showPopup("❌ " + (result.error || "Failed to publish product"), "error");
          }
        } catch (error) {
          console.error("Error:", error);
          showPopup("❌ Failed to publish product!", "error");
        }
      }
    );
  };

  //  UNPUBLISH PRODUCT
  const handleUnpublish = async (id: number, title: string) => {
    showConfirm(
      `Unpublish "${title}"?\n\nThis will hide it from customers (back to draft).`,
      async () => {
        try {
          const res = await fetch(`http://localhost:5000/products/${id}/unpublish`, {
            method: "PATCH",
          });

          const result = await res.json();

          if (res.ok) {
            showPopup("Product unpublished successfully! Check your email for confirmation.", "success");
            fetchMyProducts(sellerEmail);
            fetchRecentActivity(sellerEmail);
          } else {
            showPopup("❌ " + (result.error || "Failed to unpublish product"), "error");
          }
        } catch (error) {
          console.error("Error:", error);
          showPopup("❌ Failed to unpublish product!", "error");
        }
      }
    );
  };

  // GET ACTION ICON
  const getActionIcon = (action: string) => {
    switch (action) {
      case "created": return "➕";
      case "updated": return "✏️";
      case "deleted": return "🗑️";
      case "published": return "✅";
      case "unpublished": return "🔴";
      default: return "📦";
    }
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

  // SHOW LOADING WHILE VERIFYING
  if (isVerifying) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Verifying seller access...</p>
        </div>
      </div>
    );
  }

  //  MAIN DASHBOARD UI
  return (
    <div className="dashboard-container">
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

      <div className="dashboard-wrapper">
        <div className="seller-header">
          <div className="seller-info">
            <div className="seller-avatar">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="seller-welcome">Seller Dashboard </h2>
              <p className="seller-subtitle">Welcome, {sellerName}!</p>
              <p className="seller-email">{sellerEmail}</p>
            </div>
          </div>
          <div className="seller-header-buttons">
            <button 
              className="add-product-btn" 
              onClick={() => navigate("/add-product")}
            >
              ➕ Add Product
            </button>
            <button 
              className="view-store-btn" 
              onClick={() => navigate("/products")}
            >
              🏪 View Store
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
          <div className="stat-card stat-published">
            <h3>{products.filter(p => p.status === "published").length}</h3>
            <p>Published</p>
          </div>
          <div className="stat-card stat-draft">
            <h3>{products.filter(p => p.status === "draft").length}</h3>
            <p>Drafts</p>
          </div>
          <div className="stat-card stat-activity">
            <h3>{recentActivity.length}</h3>
            <p>Recent Actions</p>
          </div>
        </div>


        <div className="dashboard-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading your products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Products Yet</h3>
              <p>Start by adding your first product!</p>
              <button 
                className="add-first-product-btn"
                onClick={() => navigate("/add-product")}
              >
                ➕ Add Your First Product
              </button>
            </div>
          ) : (
            <>
              <div className="products-table-container">
                <h2>My Products ({products.length})</h2>
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img 
                            src={product.image} 
                            alt={product.title}
                            className="product-thumbnail"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/60x60?text=No+Image';
                            }}
                          />
                        </td>
                        <td className="product-title">{product.title}</td>
                        <td className="product-price">${product.price.toFixed(2)}</td>
                        <td className="product-category">{product.category}</td>
                        <td>
                          <span className={`status-badge status-${product.status}`}>
                            {product.status === "draft" ? "📝 Draft" : "✅ Published"}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => navigate(`/edit-product/${product.id}`)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(product.id, product.title)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                          
                          {product.status === "draft" ? (
                            <button
                              className="btn-publish"
                              onClick={() => handlePublish(product.id, product.title)}
                              title="Publish"
                            >
                              ✅
                            </button>
                          ) : (
                            <button
                              className="btn-unpublish"
                              onClick={() => handleUnpublish(product.id, product.title)}
                              title="Unpublish"
                            >
                              🔴
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

           
              <div className="activity-section">
                <h2>📋 Recent Activity</h2>
                {recentActivity.length === 0 ? (
                  <div className="empty-activity">
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <ul className="activity-list">
                    {recentActivity.slice(0, 10).map((activity) => (
                      <li key={activity.id} className={`activity-item activity-${activity.action}`}>
                        <span className="activity-icon">
                          {getActionIcon(activity.action)}
                        </span>
                        <div className="activity-content">
                          <span className="activity-text">
                            <strong>{activity.action.toUpperCase()}</strong>: {activity.product_title}
                          </span>
                          <span className="activity-time">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;