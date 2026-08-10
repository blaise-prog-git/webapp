import { Link } from 'react-router-dom';
import { StepIndicator } from './StepIndicator';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface WizardLayoutProps {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
}

export function WizardLayout({ step, title, subtitle, children, showBack = true, backTo, backLabel }: WizardLayoutProps) {
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-[800px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Labliss" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            {showBack && backTo && (
              <Link
                to={backTo}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{backLabel || 'Back'}</span>
              </Link>
            )}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-[#E85D2B] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#E85D2B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-gray-50">
        <div className="max-w-[800px] mx-auto px-6 py-6">
          <StepIndicator currentStep={step} />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[800px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && <p className="text-gray-500">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
