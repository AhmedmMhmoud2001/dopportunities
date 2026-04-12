import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth_context'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setIsLoading(true)
          try {
            await signIn({ email, password })
            navigate('/', { replace: true })
          } catch (err) {
            setError(err?.message || 'فشل تسجيل الدخول')
          } finally {
            setIsLoading(false)
          }
        }}
        style={{
          width: 'min(420px, 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 18,
          background: '#fff',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>تسجيل دخول المسؤول</h1>
        <p style={{ marginTop: 8, color: '#475569' }}>
          قم بتسجيل الدخول بحساب مسؤول (النظام الخلفي يتطلب مسؤول لإدارة اللوحة).
        </p>

        <label style={{ display: 'block', marginTop: 12, fontWeight: 700, color: '#0f172a' }}>
          البريد الإلكتروني
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
            style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
          />
        </label>

        <label style={{ display: 'block', marginTop: 12, fontWeight: 700, color: '#0f172a' }}>
          كلمة المرور
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
            style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
          />
        </label>

        {error ? (
          <div style={{ marginTop: 12, color: '#b91c1c', fontWeight: 700 }}>
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: 14,
            width: '100%',
            padding: 11,
            border: 0,
            borderRadius: 12,
            background: '#0f172a',
            color: '#fff',
            fontWeight: 800,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  )
}

