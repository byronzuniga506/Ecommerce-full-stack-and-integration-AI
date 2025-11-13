import React from "react";
import "../index.css";

interface FiltersProps {
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
}

const Filters: React.FC<FiltersProps> = ({
  priceRange,
  onPriceChange,
  minRating,
  onRatingChange,
}) => {
  return (
    <div className="filters">
      <h3>Filters</h3>

      <div className="filter-section">
        <label>Price Range</label>
        <input
          type="range"
          min="0"
          max="1000"
          value={priceRange[1]}
          onChange={(e) => onPriceChange([0, Number(e.target.value)])}
        />
        <span>${priceRange[0]} - ${priceRange[1]}</span>
      </div>

      <div className="filter-section">
        <label>Rating</label>
        <select
          value={minRating}
          onChange={(e) => onRatingChange(Number(e.target.value))}
        >
          <option value={0}>All Ratings</option>
          <option value={3}>3★ & above</option>
          <option value={4}>4★ & above</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;