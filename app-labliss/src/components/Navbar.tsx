import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Labliss" className="h-9 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-extrabold text-[#E85D2B] tracking-tight">Labliss</span>
              <span className="text-[9px] text-gray-500 font-semibold tracking-[0.15em] uppercase">Cakes & Sweeties</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {isHome ? (
              <>
                <a href="#/menu" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">Menu<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#E85D2B] transition-all group-hover:w-full" /></a>
                <a href="#/menu" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">Packages<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#E85D2B] transition-all group-hover:w-full" /></a>
                <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">Contact<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#E85D2B] transition-all group-hover:w-full" /></a>
              </>
            ) : (
              <>
                <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">Home<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#E85D2B] transition-all group-hover:w-full" /></Link>
                <Link to="/menu" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">Menu<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#E85D2B] transition-all group-hover:w-full" /></Link>
                <Link to="/cart" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">Cart<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#E85D2B] transition-all group-hover:w-full" /></Link>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-[#E85D2B] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[#E85D2B] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-short">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              to="/menu"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#E85D2B] text-white text-sm font-semibold rounded-full hover:bg-[#D14E1E] hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              Order Now <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-700">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-xl p-6 flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="self-end p-2 mb-6"><X className="w-6 h-6" /></button>
            <div className="flex flex-col gap-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-gray-700 hover:text-[#E85D2B]">Home</Link>
              <Link to="/menu" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-gray-700 hover:text-[#E85D2B]">Menu</Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-gray-700 hover:text-[#E85D2B]">Cart</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
