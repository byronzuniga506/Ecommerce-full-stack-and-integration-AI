import React, { useEffect, useState } from "react";
import axios from "axios";
import "../index.css";

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: number;
  fullName: string;
  totalPrice: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
}

const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        setError("Please log in to view your orders.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/get-orders/${email}`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading your orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="orders-page">
      <h1>My Orders 📦</h1>

      {orders.length === 0 ? (
        <p>You haven’t placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.orderId} className="order-card">
            <h3>Order #{order.orderId}</h3>
            <p><strong>Total:</strong> 💲{order.totalPrice.toFixed(2)}</p>
            <p>
              <strong>Address:</strong> {order.address}, {order.city}, {order.state} - {order.pincode}
            </p>
            <hr />
            <div className="order-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <p>{item.title}</p>
                  <p>Qty: {item.quantity}</p>
                  <p>💲{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrdersPage;
