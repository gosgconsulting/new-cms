import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max,
}: QuantitySelectorProps) {
  const canDecrement = quantity > min;
  const canIncrement = max === undefined || quantity < max;

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
        Quantity
      </label>
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={onDecrement}
          disabled={!canDecrement}
          aria-label="Decrease quantity"
          className={`h-10 w-10 flex items-center justify-center border-r border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:ring-offset-1 ${
            canDecrement
              ? "hover:bg-gray-50 cursor-pointer active:bg-gray-100"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span
          id="quantity"
          className="h-10 flex items-center justify-center px-4 text-sm font-medium min-w-[3rem] bg-white"
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={!canIncrement}
          aria-label="Increase quantity"
          className={`h-10 w-10 flex items-center justify-center border-l border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:ring-offset-1 ${
            canIncrement
              ? "hover:bg-gray-50 cursor-pointer active:bg-gray-100"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
