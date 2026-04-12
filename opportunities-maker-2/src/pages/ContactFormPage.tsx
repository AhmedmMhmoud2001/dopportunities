import { useState } from 'react';
import './ContactUsPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { apiRequest } from '../lib/api';
import { useAuth } from '../auth/auth_context';
import { useEffect } from 'react';
import { MAIN_NAV_ITEMS } from '../config/mainNav';

function ContactFormPage() {
  const { token } = useAuth() as any;

  const handleRegisterClick = () => {};

  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    phoneNumber: '',
    activity: ''
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<Array<{ id: number; trackingCode: string; status: string; activity: string; createdAt: string; notes?: string | null }>>([]);
  const [isLoadingMy, setIsLoadingMy] = useState(false);
  const [myRequestsError, setMyRequestsError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const created = await apiRequest<{ trackingCode: string; firstName: string; secondName: string; status: string; notes?: string | null; }>('/v1/contacts', { method: 'POST', token, body: formData });
      const code = String(created.trackingCode);
      window.location.href = `/contact/details/${encodeURIComponent(code)}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل إرسال الطلب';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function loadMyRequests() {
    if (!token) return;
    setIsLoadingMy(true);
    setMyRequestsError(null);
    try {
      const data = await apiRequest<Array<{ id: number; trackingCode: string; status: string; activity: string; createdAt: string; notes?: string | null }>>('/v1/contacts/my', { token });
      setMyRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'تعذّر تحميل طلباتك';
      setMyRequestsError(msg);
      setMyRequests([]);
    } finally {
      setIsLoadingMy(false);
    }
  }

  useEffect(() => {
    loadMyRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="contact-us-page">
      <Header navItems={MAIN_NAV_ITEMS} registerButtonText="سجل الآن" onRegisterClick={handleRegisterClick} />
      <main className="contact-us-content page-enter">
        <div className="container">
          <AnimatedSection animationType="fade-in-up" delay={0}>
            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={handleSubmit}>
                {submitError && <div className="form-error" role="alert">{submitError}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <input type="text" id="firstName" name="firstName" placeholder="الاسم الأول" value={formData.firstName} onChange={handleChange} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <input type="text" id="secondName" name="secondName" placeholder="الاسم الثاني" value={formData.secondName} onChange={handleChange} className="form-input" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <input type="tel" id="phoneNumber" name="phoneNumber" placeholder="رقم الهاتف" value={formData.phoneNumber} onChange={handleChange} className="form-input" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <input type="text" id="activity" name="activity" placeholder="النشاط" value={formData.activity} onChange={handleChange} className="form-input" required />
                  </div>
                </div>
                <div className="form-row">
                  <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? 'جارٍ الإرسال…' : 'رفع الطلب'}
                  </button>
                </div>
              </form>
            </div>
          </AnimatedSection>

          {token ? (
            <AnimatedSection animationType="fade-in-up" delay={100}>
              <div className="contact-form-wrapper" style={{ marginTop: 20 }}>
                <div className="form-row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>طلباتك</h3>
                  <button type="button" className="submit-button" onClick={loadMyRequests} disabled={isLoadingMy}>
                    {isLoadingMy ? 'تحديث…' : 'تحديث'}
                  </button>
                </div>
                <div style={{ marginTop: 12 }}>
                  {myRequestsError ? (
                    <div className="form-error" role="alert">{myRequestsError}</div>
                  ) : null}
                  {!myRequests.length && !myRequestsError ? (
                    <div style={{ color: '#64748b' }}>
                      لا توجد طلبات مرتبطة بحسابك بعد. إذا أرسلت طلبًا قبل تسجيل الدخول، لن يظهر هنا؛ أرسل طلبًا جديدًا وأنت مسجّل لربطه بحسابك.
                    </div>
                  ) : null}
                  {myRequests.length ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ textAlign: 'right', color: '#475569' }}>
                            <th style={{ padding: '8px 6px' }}>رقم التتبّع</th>
                            <th style={{ padding: '8px 6px' }}>النشاط</th>
                            <th style={{ padding: '8px 6px' }}>الحالة</th>
                            <th style={{ padding: '8px 6px' }}>التاريخ</th>
                            <th style={{ padding: '8px 6px' }} />
                          </tr>
                        </thead>
                        <tbody>
                          {myRequests.map((r) => (
                            <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px 6px', fontFamily: 'monospace' }}>{r.trackingCode}</td>
                              <td style={{ padding: '8px 6px' }}>{r.activity}</td>
                              <td style={{ padding: '8px 6px' }}>{r.status}</td>
                              <td style={{ padding: '8px 6px' }}>{new Date(r.createdAt).toLocaleString()}</td>
                              <td style={{ padding: '8px 6px' }}>
                                <a className="submit-button" href={`/contact/details/${encodeURIComponent(r.trackingCode)}`} style={{ textDecoration: 'none', padding: '6px 12px', fontSize: 14 }}>
                                  عرض التفاصيل
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              </div>
            </AnimatedSection>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ContactFormPage;

