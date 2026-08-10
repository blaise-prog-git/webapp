import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from '@/hooks/useCart';
import { ToastProvider } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AIChat } from '@/components/AIChat';
import { HomePage } from '@/pages/HomePage';
import { MenuPage } from '@/pages/MenuPage';
import { CartPage } from '@/pages/CartPage';
import { DeliveryPage } from '@/pages/DeliveryPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { Receipt } from '@/sections/Receipt';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Customer layout wrapper (navbar + chat on non-wizard pages, or just base)
function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <AIChat />
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <ScrollToTop />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<CustomerShell><HomePage /></CustomerShell>} />
          <Route path="/menu" element={<CustomerShell><MenuPage /></CustomerShell>} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/receipt" element={<Receipt />} />
        </Routes>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
