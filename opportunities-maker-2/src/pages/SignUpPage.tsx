import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../auth/auth_context';

import './AuthPages.css';
import { MAIN_NAV_ITEMS } from '../config/mainNav';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="app">
      <div className="app-background"></div>
      <Header
        navItems={MAIN_NAV_ITEMS}
        registerButtonText="سجل الآن"
        onRegisterClick={() => navigate('/signup')}
      />

      <main className="main-content page-enter">
        <section className="auth-shell">
          <div className="auth-card">
            <h1 className="auth-title">إنشاء حساب</h1>
            <p className="auth-subtitle">أنشئ حساباً جديداً خلال ثوانٍ.</p>

            <form
              className="auth-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setIsLoading(true);
                try {
                  await signUp(email, password, name);
                  navigate('/', { replace: true });
                } catch (err: any) {
                  setError(err?.message || 'فشل إنشاء الحساب');
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <label className="auth-label">
                الاسم (اختياري)
                <input
                  className="auth-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="اسمك"
                />
              </label>

              <label className="auth-label">
                البريد الإلكتروني
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                />
              </label>

              <label className="auth-label">
                كلمة المرور
                <input
                  className="auth-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </label>

              {error ? <div className="auth-error">{error}</div> : null}

              <button className="auth-submit" type="submit" disabled={isLoading}>
                {isLoading ? 'جارٍ إنشاء الحساب…' : 'إنشاء حساب'}
              </button>
            </form>

            <div className="auth-footer">
              لديك حساب بالفعل؟ <Link to="/signin">تسجيل الدخول</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

