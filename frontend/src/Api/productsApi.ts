import axios from "axios";

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
    // ✅ Fetch from Fake Store API
    const fakeStoreResponse = await axios.get<Product[]>(
      "https://fakestoreapi.com/products?limit=100"
    );
    const fakeStoreProducts = fakeStoreResponse.data;

    // ✅ Fetch from your backend (seller products)
    let sellerProducts: Product[] = [];
    try {
      const sellerResponse = await axios.get<Product[]>(
        "http://localhost:5000/products"
      );
      sellerProducts = sellerResponse.data;
    } catch (error) {
      console.log("Seller backend not available, showing Fake Store products only");
    }

    // ✅ Combine both arrays
    const allProducts = [...fakeStoreProducts, ...sellerProducts];

    console.log(`✅ Total products loaded: ${allProducts.length}`);
    console.log(`   - Fake Store: ${fakeStoreProducts.length}`);
    console.log(`   - Seller: ${sellerProducts.length}`);

    return allProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return empty array if API fails
  }
};