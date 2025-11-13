import React from "react";
import "../index.css";
import ProductCard from "./ProductCard";
import { Product } from "../pages/ProductsPage";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  if (products.length === 0)
    return <h3 className="no-results">No products found 😢</h3>;

  return (
    <div className="products-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default ProductGrid;
