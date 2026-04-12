import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import BlogsPage from './pages/BlogsPage';
import SingleBlogPage from './pages/SingleBlogPage';
import FAQsPage from './pages/FAQsPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactFormPage from './pages/ContactFormPage';
import TrackOrderPage from './pages/TrackOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import LocationsPage from './pages/LocationsPage';
import TermsPage from './pages/TermsPage';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pages" element={<Navigate to="/" replace />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/blog/:slugOrId" element={<SingleBlogPage />} />
        <Route path="/faq" element={<FAQsPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactFormPage />} />
        <Route path="/contact/track" element={<TrackOrderPage />} />
        <Route path="/contact/details/:code" element={<OrderDetailsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;
