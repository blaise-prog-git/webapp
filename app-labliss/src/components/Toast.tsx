import { useToast } from '@/hooks/useToast';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'border-l-green-500 bg-white',
  error: 'border-l-red-500 bg-white',
  info: 'border-l-blue-500 bg-white',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 min-w-[300px] max-w-[400px] ${colors[toast.type]}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                toast.type === 'success' ? 'text-green-500' :
                toast.type === 'error' ? 'text-red-500' : 'text-blue-500'
              }`} />
              <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
