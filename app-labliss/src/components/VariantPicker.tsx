import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Minus, Plus } from 'lucide-react';
import type { MenuItem, Variant } from '@/types';
import { formatNaira } from '@/lib/api';

interface VariantPickerProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (variant: Variant, quantity: number) => void;
}

export function VariantPicker({ item, isOpen, onClose, onAdd }: VariantPickerProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(item.minQty);

  const handleClose = () => {
    onClose();
    setSelectedVariant(null);
    setQuantity(item.minQty);
  };

  const handleAdd = () => {
    if (selectedVariant) {
      onAdd(selectedVariant, quantity);
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={item.image || '/hero.jpg'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-5">
                <h2 className="text-xl font-bold text-white">{item.name}</h2>
                <p className="text-white/80 text-sm">Min: {item.minQty} units &bull; Select a type</p>
              </div>
            </div>

            {/* Variant List */}
            <div className="p-5 overflow-y-auto max-h-[50vh]">
              <div className="space-y-2">
                {item.variants?.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(variant);
                      if (quantity < item.minQty) setQuantity(item.minQty);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                      selectedVariant?.id === variant.id
                        ? 'border-[#E85D2B] bg-[#FFF0EB]'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedVariant?.id === variant.id
                            ? 'border-[#E85D2B] bg-[#E85D2B]'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedVariant?.id === variant.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{variant.name}</span>
                    </div>
                    <span className="font-bold text-[#E85D2B]">{formatNaira(variant.price)}</span>
                  </button>
                ))}
              </div>

              {/* Quantity Selector */}
              {selectedVariant && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-5 pt-5 border-t border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Quantity</span>
                    <span className="text-sm text-gray-400">Min: {item.minQty}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity((q) => Math.max(item.minQty, q - 1))}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {quantity >= item.minQty && (
                    <p className="mt-3 text-sm font-semibold text-gray-600">
                      Subtotal: {formatNaira(selectedVariant.price * quantity)}
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleAdd}
                disabled={!selectedVariant}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold transition-all ${
                  selectedVariant
                    ? 'bg-[#E85D2B] text-white hover:bg-[#D14E1E] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add to Cart <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
