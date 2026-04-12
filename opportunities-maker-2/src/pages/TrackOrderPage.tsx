import { useState } from 'react';
import './ContactUsPage.css';
import Header from '../components/Header';
import { MAIN_NAV_ITEMS } from '../config/mainNav';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';

function TrackOrderPage() {
  const handleRegisterClick = () => {};

  const [orderNumber, setOrderNumber] = useState('');

  const handleOrderNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderNumber(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    window.location.href = `/contact/details/${encodeURIComponent(orderNumber.trim())}`;
  };

  return (
    <div className="contact-us-page">
      <Header navItems={MAIN_NAV_ITEMS} registerButtonText="سجل الآن" onRegisterClick={handleRegisterClick} />
      <main className="contact-us-content page-enter">
        <div className="container">
          <AnimatedSection animationType="scale-in" delay={0}>
            <div className="order-tracking-wrapper">
              <form className="order-tracking-form" onSubmit={handleSubmit}>
                <div className="tracking-input-wrapper">
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    placeholder="ادخل رقم طلبك لمتابعة حالة الطلب"
                    value={orderNumber}
                    onChange={handleOrderNumberChange}
                    className="tracking-input"
                    required
                  />
                </div>
                <div className="tracking-button-wrapper">
                  <button type="submit" className="tracking-button">
                    ادخل
                  </button>
                </div>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TrackOrderPage;

