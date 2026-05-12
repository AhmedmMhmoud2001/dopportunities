import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiSave } from 'react-icons/fi'

export function ContactFormSettingsPage() {
  const { token } = useAuth()
  const [noticeText, setNoticeText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function load() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/contact-form-settings')
      setNoticeText(data?.noticeText != null ? String(data.noticeText) : '')
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
      await apiRequest('/v1/contact-form-settings', {
        method: 'PUT',
        token,
        body: { noticeText: noticeText.trim() ? noticeText.trim() : null },
      })
      setSuccess('تم الحفظ')
      await load()
    } catch (err) {
      setError(err?.message || 'فشل الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell
      title="رسالة صفحة التواصل"
      subtitle="النص يظهر فوق نموذج «رفع الطلب» في الموقع العام (/contact). اتركه فارغاً لعدم إظهار رسالة."
    >
      <div className="dash-card">
        {isLoading ? (
          <div className="dash-subtitle">جارٍ التحميل…</div>
        ) : (
          <form onSubmit={save} style={{ display: 'grid', gap: 14, marginTop: 8 }}>
            <label className="dash-card__label" style={{ display: 'block', marginBottom: 6 }}>
              نص الرسالة
            </label>
            <textarea
              className="form-input"
              rows={4}
              dir="rtl"
              placeholder="مثال: يتم التواصل معك خلال 24 ساعة."
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              style={{ minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }}
            />

            {error ? (
              <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
            ) : null}
            {success ? (
              <p style={{ margin: 0, color: '#047857', fontWeight: 700 }}>{success}</p>
            ) : null}

            <button type="submit" className="dash-btn dash-btn-primary" disabled={isSaving}>
              <FiSave style={{ marginInlineEnd: 6 }} />
              {isSaving ? 'جارٍ الحفظ…' : 'حفظ'}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  )
}
