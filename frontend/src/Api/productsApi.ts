import axios from "axios";
import API_URL from "../config";

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

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    console.log(`🔄 Fetching products from: ${API_URL}/products`);
    
    // ✅ ONLY fetch from YOUR backend (which has 30 demo products + seller products)
    const response = await axios.get<Product[]>(`${API_URL}/products`);
    const products = response.data;

    console.log(`✅ Total products loaded: ${products.length}`);
    console.log(`   Source: Your Backend (Demo + Seller products)`);

    return products;
  } catch (error) {
    console.error("❌ Error fetching products from backend:", error);
    
    // Optional: Return empty array or show error message
    return [];
  }
};

export const fetchProductById = async (id: number): Promise<Product | null> => {
  try {
    const response = await axios.get<Product>(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

// Search products
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const allProducts = await fetchProducts();
    const lowerQuery = query.toLowerCase();
    
    return allProducts.filter(product => 
      product.title.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};