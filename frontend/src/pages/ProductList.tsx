import React, { useEffect, useState } from "react";
import { Container, Box, Typography } from "@mui/material";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("myProducts") || "[]");
    setProducts(storedProducts);
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Products List
      </Typography>
      {products.length === 0 && <Typography>No products found.</Typography>}
      {products.map((product) => (
        <Box key={product.id} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
          <Typography variant="h6">{product.title}</Typography>
          <Typography>Price: ${product.price}</Typography>
          <Typography>Category: {product.category}</Typography>
          <Typography>{product.description}</Typography>
          <img src={product.image} alt={product.title} width="100" />
        </Box>
      ))}
    </Container>
  );
};

export default ProductList;
