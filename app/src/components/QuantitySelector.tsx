import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (qty: number) => void;
  compact?: boolean;
}

export function QuantitySelector({ quantity, onChange, compact = false }: QuantitySelectorProps) {
  const btnSize = compact ? 'w-8 h-8' : 'w-9 h-9';
  const iconSize = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 0}
        className={`${btnSize} rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#E85D2B] hover:text-[#E85D2B] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600`}
      >
        <Minus className={iconSize} />
      </button>
      <div className={`${compact ? 'w-10' : 'w-12'} h-9 flex items-center justify-center font-semibold text-gray-900`}>
        {quantity}
      </div>
      <button
        onClick={() => onChange(quantity + 1)}
        className={`${btnSize} rounded-lg bg-[#E85D2B] text-white flex items-center justify-center hover:bg-[#D14E1E] transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}
