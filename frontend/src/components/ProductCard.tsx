import React from "react";
import "../index.css";
import { Product } from "../pages/ProductsPage";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate(`/buy/${product.id}`, { state: { product } });
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.title} className="product-img" />
      <h3 className="product-title">{product.title}</h3>
      <p className="product-category">{product.category}</p>
      <p className="product-price">💲{product.price}</p>
      <p className="product-rating">
        ⭐ {product.rating.rate} ({product.rating.count})
      </p>
      <div className="btn">
      <button className="Add-Cart" onClick={() => onAddToCart(product)}>
        🛒 Add to cart
      </button>
      <button className="Buy-Now" onClick={handleBuyNow}>
        Buy Now
      </button>
      </div>
    </div>
  );
};

export default ProductCard;
