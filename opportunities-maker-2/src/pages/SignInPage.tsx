import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../auth/auth_context';

import './AuthPages.css';
import { MAIN_NAV_ITEMS } from '../config/mainNav';

export default function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
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
            <h1 className="auth-title">تسجيل الدخول</h1>
            <p className="auth-subtitle">ادخل بريدك الإلكتروني وكلمة المرور.</p>

            <form
              className="auth-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setIsLoading(true);
                try {
                  await signIn(email, password);
                  navigate('/', { replace: true });
                } catch (err: any) {
                  setError(err?.message || 'فشل تسجيل الدخول');
                } finally {
                  setIsLoading(false);
                }
              }}
            >
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </label>

              {error ? <div className="auth-error">{error}</div> : null}

              <button className="auth-submit" type="submit" disabled={isLoading}>
                {isLoading ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول'}
              </button>
            </form>

            <div className="auth-footer">
              ليس لديك حساب؟ <Link to="/signup">إنشاء حساب</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

