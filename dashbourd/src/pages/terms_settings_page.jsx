import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'

export function TermsSettingsPage() {
  const { token } = useAuth()
  const [terms, setTerms] = useState(null)
  const [formData, setFormData] = useState({ title: '', content: '', version: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadTerms()
  }, [])

  async function loadTerms() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiRequest('/v1/terms/admin', { token })
      setTerms(data)
      setFormData({ title: data.title || '', content: data.content || '', version: data.version || '1.0' })
    } catch (err) {
      setError(err?.message || 'فشل تحميل الشروط')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await apiRequest('/v1/terms/admin', {
        method: 'PUT',
        token,
        body: formData
      })
      setTerms(data)
      setSuccess('تم حفظ الشروط والأحكام بنجاح')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err?.message || 'فشل حفظ الشروط')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <PageShell title="إعدادات الشروط والأحكام" subtitle="إدارة شروط الخدمة">
        <div className="loading-state">جارٍ التحميل...</div>
      </PageShell>
    )
  }

  return (
    <PageShell title="إعدادات الشروط والأحكام" subtitle="تعديل ونشر الشروط والأحكام">
      <div className="terms-settings">
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <form onSubmit={handleSave}>
          <div className="form-card">
            <div className="form-group">
              <label className="form-label">العنوان</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="الشروط والأحكام"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">الإصدار</label>
              <input
                type="text"
                className="form-input"
                value={formData.version}
                onChange={e => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">المحتوى</label>
              <textarea
                className="form-textarea"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder={'الشروط والأحكام\n\nأدخل نص الشروط هنا. يمكنك استخدام أسطر جديدة لفصل الفقرات.'}
                rows={15}
                required
              />
              <p className="form-hint">نص عادي فقط — يُعرض كما هو مع الحفاظ على الأسطر الجديدة</p>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </div>
        </form>

        <div className="preview-card">
          <h3 className="preview-title">معاينة</h3>
          <div className="preview-content preview-content--plain">
            {formData.content?.trim() || '—'}
          </div>
        </div>
      </div>
    </PageShell>
  )
}