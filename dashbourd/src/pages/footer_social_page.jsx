import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiSave } from 'react-icons/fi'

const EMPTY = {
  twitter: '',
  instagram: '',
  youtube: '',
  facebook: '',
  linkedin: '',
  tiktok: '',
}

const LABELS = [
  { key: 'twitter', label: 'X (تويتر)', hint: 'https://twitter.com/… أو https://x.com/…' },
  { key: 'instagram', label: 'إنستغرام', hint: 'https://instagram.com/…' },
  { key: 'youtube', label: 'يوتيوب', hint: 'https://youtube.com/…' },
  { key: 'facebook', label: 'فيسبوك', hint: 'https://facebook.com/…' },
  { key: 'linkedin', label: 'لينكد إن (اختياري)', hint: 'https://linkedin.com/…' },
  { key: 'tiktok', label: 'تيك توك (اختياري)', hint: 'https://tiktok.com/…' },
]

export function FooterSocialPage() {
  const { token } = useAuth()
  const [form, setForm] = useState(EMPTY)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function load() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/footer-social')
      const next = { ...EMPTY }
      for (const k of Object.keys(EMPTY)) {
        next[k] = data[k] ? String(data[k]) : ''
      }
      setForm(next)
    } catch (err) {
      setError(err?.message || 'فشل التحميل')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function save(e) {
    e?.preventDefault?.()
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      for (const k of Object.keys(EMPTY)) {
        const t = form[k]?.trim()
        if (t && !/^https?:\/\//i.test(t)) {
          setError(`الرابط في "${LABELS.find((x) => x.key === k)?.label || k}" يجب أن يبدأ بـ http:// أو https://`)
          setIsSaving(false)
          return
        }
      }
      const body = {}
      for (const k of Object.keys(EMPTY)) {
        body[k] = form[k]?.trim() || null
      }
      await apiRequest('/v1/footer-social', { method: 'PUT', token, body })
      setSuccess('تم الحفظ')
      await load()
    } catch (err) {
      setError(err?.message || 'فشل الحفظ — تأكد أن الرابط يبدأ بـ https://')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell
      title="روابط السوشيال (الفوتر)"
      subtitle="تظهر في الفوتر بالموقع العام. اترك الحقل فارغاً لاستخدام الرابط الافتراضي للمنصات الأربع الأساسية."
    >
      <div className="dash-card">
        {isLoading ? (
          <div className="dash-subtitle">جارٍ التحميل…</div>
        ) : (
          <form onSubmit={save} style={{ display: 'grid', gap: 14, marginTop: 8 }}>
            {LABELS.map(({ key, label, hint }) => (
              <div key={key}>
                <label className="dash-card__label" style={{ display: 'block', marginBottom: 6 }}>
                  {label}
                </label>
                <input
                  className="form-input"
                  type="url"
                  inputMode="url"
                  placeholder={hint}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  dir="ltr"
                  style={{ textAlign: 'left' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="submit" className="dash-btn dash-btn-primary" disabled={isSaving}>
                <FiSave size={16} />
                {isSaving ? 'جارٍ الحفظ…' : 'حفظ'}
              </button>
            </div>
            {error ? <div style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}
            {success ? <div style={{ color: '#15803d', fontWeight: 700 }}>{success}</div> : null}
          </form>
        )}
      </div>
    </PageShell>
  )
}

export default FooterSocialPage
