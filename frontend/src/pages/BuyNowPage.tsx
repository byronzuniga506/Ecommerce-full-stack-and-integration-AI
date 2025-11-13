import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Product } from "./ProductsPage";
import "../index.css";

interface LocationState {
  product: Product;
}

const BuyNowPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  if (!state || !state.product) return <p>Product not found!</p>;

  const { product } = state;
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => setQuantity(Math.max(1, quantity - 1));

  const handleCheckout = () => {
    navigate("/checkout", { state: { product, quantity } });
  };

  return (
    <div className="buy-now-page">
      <h1>Buy Now 🛒</h1>
      <div className="buy-now-container">
        <img src={product.image} alt={product.title} className="buy-now-img" />
        <div className="buy-now-details">
          <h2>{product.title}</h2>
          <p className="product-category">{product.category}</p>
          <p className="product-price">💲{product.price}</p>
          <div className="quantity-controls">
            <button onClick={decreaseQuantity}>-</button>
            <span className="qty">{quantity}</span>
            <button onClick={increaseQuantity}>+</button>
          </div>
          <p>Total: 💲{(product.price * quantity).toFixed(2)}</p>
          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyNowPage;
