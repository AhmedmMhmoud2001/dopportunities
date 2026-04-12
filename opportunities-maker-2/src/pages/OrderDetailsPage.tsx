import { useEffect, useState } from 'react';
import './ContactUsPage.css';
import Header from '../components/Header';
import { MAIN_NAV_ITEMS } from '../config/mainNav';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { apiRequest } from '../lib/api';

function OrderDetailsPage() {
  const handleRegisterClick = () => {};

  const [orderData, setOrderData] = useState({ orderId: '', name: '', status: '', notes: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const match = window.location.pathname.match(/\/contact\/details\/(.+)$/);
    const code = match?.[1] ? decodeURIComponent(match[1]) : '';
    if (!code) return;
    (async () => {
      try {
        const data = await apiRequest<{ trackingCode: string; firstName: string; secondName: string; status: string; notes?: string | null; }>(`/v1/contacts/track/${encodeURIComponent(code)}`);
        setOrderData({
          orderId: String(data.trackingCode),
          name: `${data.firstName} ${data.secondName}`,
          status: data.status ?? '',
          notes: data.notes ?? ''
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'تعذر العثور على الطلب';
        setError(msg);
      }
    })();
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="contact-us-page">
      <Header navItems={MAIN_NAV_ITEMS} registerButtonText="سجل الآن" onRegisterClick={handleRegisterClick} />
      <main className="contact-us-content page-enter">
        <div className="container">
          <AnimatedSection animationType="fade-in-up" delay={0}>
            <div className="order-details-wrapper">
              {error ? <div className="form-error" role="alert">{error}</div> : null}
              <div>
                <div className="order-header">
                  <h2 className="order-title">رقم طلبك</h2>
                  <p className="order-number">{orderData.orderId}#</p>
                </div>
                <div className="progress-indicator">
                  <div className="progress-step completed">
                    <div className="step-circle completed"></div>
                    <div className="step-line completed"></div>
                  </div>
                  <div className="progress-step active">
                    <div className="step-circle active"></div>
                    <div className="step-line pending"></div>
                  </div>
                  <div className="progress-step pending">
                    <div className="step-circle pending"></div>
                    <div className="step-line pending"></div>
                  </div>
                  <div className="progress-step pending">
                    <div className="step-circle pending last"></div>
                  </div>
                </div>
              </div>
              <div className="order-fields">
                <div className="order-field">
                  <label className="field-label">الاسم:</label>
                  <input type="text" value={orderData.name} readOnly className="order-field-input" />
                </div>
                <div className="order-field">
                  <label className="field-label">الحالة:</label>
                  <input type="text" value={orderData.status} readOnly className="order-field-input" />
                </div>
                <div className="order-field">
                  <label className="field-label">ملاحظاتنا:</label>
                  <input type="text" value={orderData.notes} readOnly className="order-field-input" />
                </div>
              </div>
              <div className="print-button-wrapper">
                <button type="button" className="print-button" onClick={handlePrint}>
                  <span>طباعة</span>
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default OrderDetailsPage;

