import './App.css'
import './styles/dashboard.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './layout/dashboard_layout'
import { ProtectedRoute } from './auth/protected_route'
import { LoginPage } from './pages/login_page'
import { OverviewPage } from './pages/overview_page'
import { UsersPage } from './pages/users_page'
import { BlogsPage } from './pages/blogs_page'
import { ServicesPage } from './pages/services_page'
import TestimonialsPage from './pages/testimonials_page'
import { FaqsPage } from './pages/faqs_page'
import { ContactsPage } from './pages/contacts_page'
import { AboutPage } from './pages/about_page'
import { TermsSettingsPage } from './pages/terms_settings_page'
import { TermsPage } from './pages/terms_page'
import { LocationsPage } from './pages/locations_page'
import { HomeFeaturesPage } from './pages/home_features_page'
import { HomeIntroPage } from './pages/home_intro_page'
import { HomeWorkConsultantPage } from './pages/home_work_consultant_page'
import FooterSocialPage from './pages/footer_social_page'
import { SiteBrandingPage } from './pages/site_branding_page'
import { ContactFormSettingsPage } from './pages/contact_form_settings_page'
import { useLocale } from './hooks/use_locale'

function App() {
  // Ensure RTL and Arabic lang are applied globally
  useLocale()
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Public Terms Page */}
      <Route path="/terms" element={<TermsPage />} />

      {/* Admin Dashboard Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <OverviewPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/home-intro"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HomeIntroPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/home-work-consultant"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HomeWorkConsultantPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogs"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BlogsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ServicesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/testimonials"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TestimonialsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faqs"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FaqsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ContactsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AboutPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/terms"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TermsSettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/locations"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <LocationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/home-features"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HomeFeaturesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/footer-social"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FooterSocialPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/branding"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SiteBrandingPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/contact-form"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ContactFormSettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
