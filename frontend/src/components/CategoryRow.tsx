import React from "react";
import "../index.css";

interface CategoryRowProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  categories,
  selectedCategory,
  onSelect,
}) => {
  // Log categories once before the render
  console.log("categories", categories);

  return (
    <div className="category-row">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryRow;
