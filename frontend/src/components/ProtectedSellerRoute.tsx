import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API_URL from "../config";

interface ProtectedSellerRouteProps {
  children: React.ReactNode;
}

const ProtectedSellerRoute: React.FC<ProtectedSellerRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const sellerEmail = localStorage.getItem("sellerEmail");
    const sellerStatus = localStorage.getItem("sellerStatus");

    //  No email - not logged in
    if (!sellerEmail) {
      setPopupMessage(" Please login first to access this page");
      setShowPopup(true);
      setIsAuthenticated(false);
      setTimeout(() => {
        setShowPopup(false);
        setShouldRedirect(true);
      }, 2000);
      return;
    }

    //  Not approved
    if (sellerStatus !== "approved") {
      setPopupMessage("⚠️ Your account is not approved yet. Please wait for admin approval.");
      setShowPopup(true);
      setIsAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem("sellerEmail");
      localStorage.removeItem("sellerName");
      localStorage.removeItem("sellerStatus");
      
      setTimeout(() => {
        setShowPopup(false);
        setShouldRedirect(true);
      }, 2000);
      return;
    }

    //  Verify with backend
    try {
      const response = await fetch(`${API_URL}/check-seller-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sellerEmail }),
      });

      const data = await response.json();

      if (!data.isApproved) {
        setPopupMessage("⚠️ Your seller account is not approved. Please wait for admin approval.");
        setShowPopup(true);
        setIsAuthenticated(false);
        
        // Clear localStorage
        localStorage.removeItem("sellerEmail");
        localStorage.removeItem("sellerName");
        localStorage.removeItem("sellerStatus");
        
        setTimeout(() => {
          setShowPopup(false);
          setShouldRedirect(true);
        }, 2000);
        return;
      }

      //  All checks passed
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error verifying seller:", error);
      setPopupMessage("❌ Failed to verify seller status. Please login again.");
      setShowPopup(true);
      setIsAuthenticated(false);
      
      setTimeout(() => {
        setShowPopup(false);
        setShouldRedirect(true);
      }, 2000);
    }
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div style={{ 
        textAlign: "center", 
        marginTop: "50px",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div className="spinner" style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3 style={{ marginTop: '20px' }}>Verifying access...</h3>
      </div>
    );
  }

  // If not authenticated, show popup and redirect
  if (!isAuthenticated) {
    if (shouldRedirect) {
      return <Navigate to="/seller-login" replace />;
    }
    
    return (
      <>
        {showPopup && (
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
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '30px 40px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              minWidth: '350px',
              animation: 'fadeIn 0.3s ease-in'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '22px' }}>Access Denied</h2>
              <p style={{ margin: '0', fontSize: '16px', whiteSpace: 'pre-line' }}>{popupMessage}</p>
              <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
                Redirecting to login...
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // If authenticated, show the page
  return <>{children}</>;
};

export default ProtectedSellerRoute;