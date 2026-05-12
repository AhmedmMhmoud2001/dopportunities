import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/animations.css'
import App from './App.tsx'
import { AuthProvider } from './auth/auth_context'
import { SiteBrandingProvider } from './branding/site_branding_context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SiteBrandingProvider>
        <App />
      </SiteBrandingProvider>
    </AuthProvider>
  </StrictMode>,
)
