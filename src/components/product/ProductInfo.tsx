import QuantitySelector from "./QuantitySelector";
import { useState } from "react";

interface ProductInfoProps {
  category: string;
  name: string;
  price: string;
  description: string;
  details: string;
  chefsNotes: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToBag: () => void;
}

export default function ProductInfo({
  category,
  name,
  price,
  description,
  details,
  chefsNotes,
  quantity,
  onQuantityChange,
  onAddToBag,
}: ProductInfoProps) {
  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Category label */}
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {category}
      </p>

      {/* Title and Price - Price aligned top-right */}
      <div className="flex justify-between items-start gap-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 leading-tight flex-1">
          {name}
        </h1>
        <div className="text-right flex-shrink-0 pt-1">
          <p className="text-2xl md:text-3xl font-medium text-gray-900">{price}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-8 space-y-8">
        {/* Description */}
        <section>
          <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Description
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        </section>

        {/* Product Details */}
        <section>
          <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Product Details
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{details}</p>
        </section>

        {/* Chef's Notes */}
        <section>
          <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Chef's Notes
          </h2>
          <blockquote className="text-sm text-gray-600 italic leading-relaxed pl-4 border-l-2 border-gray-200">
            "{chefsNotes}"
          </blockquote>
        </section>
      </div>

      {/* Purchase Controls */}
      <div className="border-t border-gray-200 pt-8 space-y-6">
        <QuantitySelector
          quantity={quantity}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />

        <button
          onClick={onAddToBag}
          className="w-full h-14 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:ring-offset-2 shadow-sm hover:shadow-md"
        >
          Add to Bag
        </button>
      </div>
    </div>
  );
}
