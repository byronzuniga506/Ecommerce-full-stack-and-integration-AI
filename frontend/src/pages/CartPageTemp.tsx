import React, { useEffect, useState } from "react";
import { Product } from "./ProductsPage";
import "../index.css";
import { Link, useNavigate } from "react-router-dom";

// Add quantity field to cart item
interface CartItem extends Product {
  quantity: number;
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsed: Product[] = JSON.parse(savedCart);
      const cartWithQty: CartItem[] = parsed.map((item) => ({
        ...item,
        quantity: (item as any).quantity || 1,
      }));
      setCart(cartWithQty);
    }
  }, []);

  // Update cart state and localStorage
  const updateCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQuantity = (id: number) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updated);
  };

  const decreaseQuantity = (id: number) => {
    const updated = cart
      .map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
      .filter((item) => item.quantity > 0);
    updateCart(updated);
  };

  const handleRemove = (id: number) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    updateCart(updatedCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    navigate("/checkout", { state: { cart, totalPrice } });
  };

  return (
    <div className="cart-page">
      <Link to="/products" className="back-home-btn">
        Continue Shopping
      </Link>

      <h1 className="cart-title">Shopping Cart 🛒</h1>

      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty 😢</p>
      ) : (
        <div className="cart-container">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.title} className="cart-item-img" />
                <div className="cart-item-details">
                  <h3>{item.title}</h3>
                  <p className="cart-item-category">{item.category}</p>
                  <p className="cart-item-price">💲{item.price}</p>

                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={() => decreaseQuantity(item.id)}>
                      -
                    </button>
                    <span className="qty">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => increaseQuantity(item.id)}>
                      +
                    </button>
                  </div>

                  <button className="remove-btn" onClick={() => handleRemove(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>PRICE DETAILS</h2>
            <hr />
            <p>
              Price ({cart.length} items): <strong>💲{totalPrice.toFixed(2)}</strong>
            </p>
            <p>Delivery Charges: <strong>FREE</strong></p>
            <hr />
            <h3>
              Total Amount: <span className="total-amount">💲{totalPrice.toFixed(2)}</span>
            </h3>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
