import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'
import { StaffPortal } from '@/pages/StaffPortal'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ToastContainer />
      <StaffPortal />
    </ToastProvider>
  </StrictMode>,
)
