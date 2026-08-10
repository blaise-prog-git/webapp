import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'
import { AdminDashboard } from '@/pages/AdminDashboard'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ToastContainer />
      <AdminDashboard />
    </ToastProvider>
  </StrictMode>,
)
