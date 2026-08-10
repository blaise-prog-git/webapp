import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { label: 'Menu', num: 1 },
  { label: 'Cart', num: 2 },
  { label: 'Delivery', num: 3 },
  { label: 'Payment', num: 4 },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;

          return (
            <div key={step.num} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1 : 0.95,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-[#E85D2B] text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.num
                  )}
                </motion.div>
                <span
                  className={`text-xs font-medium hidden sm:block transition-colors duration-300 ${
                    isActive
                      ? 'text-gray-900 font-semibold'
                      : isCompleted
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 sm:mx-4 relative">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />
                  <motion.div
                    initial={false}
                    animate={{
                      scaleX: isCompleted ? 1 : 0,
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-green-500 rounded-full origin-left"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
