import React, { useEffect, useState } from "react";
import { fetchProducts } from "../Api/productsApi"; 
import Navbar from "../components/Navbar";
import CategoryRow from "../components/CategoryRow";
import Filters from "../components/Filters";
import ProductGrid from "../components/ProductGrid";
import CartPopup from "../popup/CartPopup";
import "../index.css";

//  Define Product interface
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Product[]>([]);
const [popupMessage, setPopupMessage] = useState<string | null>(null);

  //  Handle Add to Cart
  const handleAddToCart = (product: Product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); 
    setPopupMessage(`${product.title} added to cart!`);
  };
const closePopup = () => setPopupMessage(null);
  // Fetch all products on component mountcart
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  //  Extract unique categories
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  //  Apply filters
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesRating = product.rating.rate >= minRating;
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPrice && matchesRating && matchesSearch;
  });

  //  Loading UI
  if (loading) return <div className="loading">Loading products...</div>;

  //  Main render
  return (
    <div className="products-page">
      {/*  Navbar with search */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
      />

      {/*  Category row */}
      <CategoryRow
        categories={categories}
        selectedCategory={categoryFilter}
        onSelect={setCategoryFilter}
      />

      {/*  Filters + Product grid */}
      <div className="main-content">
        <Filters
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          minRating={minRating}
          onRatingChange={setMinRating}
        />

        {/*  Single ProductGrid with Add to Cart support */}
        <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
      {/*  Render popup if message exists */}
        {popupMessage && <CartPopup message={popupMessage} onClose={closePopup} />}
      </div>
    </div>
  );
};

export default ProductsPage;
