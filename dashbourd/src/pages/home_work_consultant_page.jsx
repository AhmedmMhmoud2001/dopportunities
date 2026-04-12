import { useCallback, useEffect, useState } from 'react'
import { apiRequest, getApiBaseUrl } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiSave, FiImage } from 'react-icons/fi'

async function uploadPublicFile(file, token) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${getApiBaseUrl()}/v1/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message || 'فشل الرفع')
  const base = getApiBaseUrl().replace(/\/api\/?$/i, '')
  const path = String(data.url || '').startsWith('/') ? data.url : `/${data.url || ''}`
  return `${base}${path}`
}

export function HomeWorkConsultantPage() {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [workTitle, setWorkTitle] = useState('')
  const [workSubtitle, setWorkSubtitle] = useState('')
  const [step1Text, setStep1Text] = useState('')
  const [step2Text, setStep2Text] = useState('')
  const [step3Text, setStep3Text] = useState('')
  const [consultantRole, setConsultantRole] = useState('')
  const [consultantHeading, setConsultantHeading] = useState('')
  const [consultantBio, setConsultantBio] = useState('')
  const [consultantImageUrl, setConsultantImageUrl] = useState('')

  const load = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/home-work-consultant')
      setWorkTitle(data.workTitle ?? '')
      setWorkSubtitle(data.workSubtitle ?? '')
      setStep1Text(data.step1Text ?? '')
      setStep2Text(data.step2Text ?? '')
      setStep3Text(data.step3Text ?? '')
      setConsultantRole(data.consultantRole ?? '')
      setConsultantHeading(data.consultantHeading ?? '')
      setConsultantBio(data.consultantBio ?? '')
      setConsultantImageUrl(data.consultantImageUrl ?? '')
    } catch (err) {
      setError(err?.message || 'فشل التحميل')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function onImageUpload(file) {
    if (!file || !token) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadPublicFile(file, token)
      setConsultantImageUrl(url)
    } catch (err) {
      setError(err?.message || 'فشل الرفع')
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await apiRequest('/v1/home-work-consultant', {
        method: 'PUT',
        token,
        body: {
          workTitle,
          workSubtitle,
          step1Text,
          step2Text,
          step3Text,
          consultantRole,
          consultantHeading,
          consultantBio,
          consultantImageUrl: consultantImageUrl.trim() || null,
        },
      })
      setSuccess('تم الحفظ بنجاح')
      await load()
    } catch (err) {
      setError(err?.message || 'فشل الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell
      title="طريقة العمل والمستشار"
      subtitle="قسم «طريقة عملنا» (الخطوات 1–3) وبطاقة المستشار على الصفحة الرئيسية."
    >
      <div className="dash-card">
        {isLoading ? (
          <div className="dash-subtitle">جارٍ التحميل…</div>
        ) : (
          <div className="home-intro-editor">
            <section className="home-intro-section">
              <h3 className="home-intro-section__title">طريقة عملنا</h3>
              <p className="home-intro-section__hint">
                العنوان يظهر كما تكتبه (يمكن أن يبدأ بـ # كما في التصميم).
              </p>
              <div className="home-intro-stat-field">
                <label className="form-label">عنوان القسم</label>
                <input
                  className="form-input"
                  value={workTitle}
                  onChange={(e) => setWorkTitle(e.target.value)}
                />
              </div>
              <div className="home-intro-stat-field">
                <label className="form-label">الوصف تحت العنوان</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={workSubtitle}
                  onChange={(e) => setWorkSubtitle(e.target.value)}
                  style={{ resize: 'vertical', minHeight: 72 }}
                />
              </div>
              <div className="home-intro-stat-field">
                <label className="form-label">نص الخطوة 1</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={step1Text}
                  onChange={(e) => setStep1Text(e.target.value)}
                  style={{ resize: 'vertical', minHeight: 72 }}
                />
              </div>
              <div className="home-intro-stat-field">
                <label className="form-label">نص الخطوة 2</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={step2Text}
                  onChange={(e) => setStep2Text(e.target.value)}
                  style={{ resize: 'vertical', minHeight: 72 }}
                />
              </div>
              <div className="home-intro-stat-field">
                <label className="form-label">نص الخطوة 3</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={step3Text}
                  onChange={(e) => setStep3Text(e.target.value)}
                  style={{ resize: 'vertical', minHeight: 72 }}
                />
              </div>
            </section>

            <section className="home-intro-section">
              <h3 className="home-intro-section__title">بطاقة المستشار</h3>
              <div className="home-intro-stat-field">
                <label className="form-label">التسمية (مثل CEO)</label>
                <input
                  className="form-input"
                  value={consultantRole}
                  onChange={(e) => setConsultantRole(e.target.value)}
                />
              </div>
              <div className="home-intro-stat-field">
                <label className="form-label">العنوان الرئيسي</label>
                <input
                  className="form-input"
                  placeholder="مثال: # المستشار أنور علي"
                  value={consultantHeading}
                  onChange={(e) => setConsultantHeading(e.target.value)}
                />
              </div>
              <div className="home-intro-stat-field">
                <label className="form-label">النص التعريفي</label>
                <textarea
                  className="form-input"
                  rows={8}
                  value={consultantBio}
                  onChange={(e) => setConsultantBio(e.target.value)}
                  style={{ resize: 'vertical', minHeight: 160 }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">صورة المستشار</label>
                <div className="home-intro-poster-row">
                  <input
                    className="form-input"
                    placeholder="رابط الصورة أو ارفع ملفاً"
                    value={consultantImageUrl}
                    onChange={(e) => setConsultantImageUrl(e.target.value)}
                  />
                  <label
                    className="file-upload-btn"
                    style={{ cursor: uploading ? 'wait' : 'pointer', flexShrink: 0 }}
                  >
                    <FiImage style={{ marginInlineEnd: 6 }} />
                    {uploading ? 'جارٍ الرفع…' : 'رفع صورة'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading}
                      onChange={(e) => onImageUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
                {consultantImageUrl ? (
                  <img
                    src={consultantImageUrl}
                    alt=""
                    className="home-intro-poster-preview"
                    loading="lazy"
                  />
                ) : null}
              </div>
            </section>

            <div className="home-intro-footer-actions">
              <button type="button" className="dash-btn dash-btn-primary" onClick={save} disabled={isSaving}>
                <FiSave size={16} />
                {isSaving ? 'جارٍ الحفظ…' : 'حفظ'}
              </button>
            </div>
            {error ? <div style={{ color: '#b91c1c', fontWeight: 600 }}>{error}</div> : null}
            {success ? <div style={{ color: '#16a34a', fontWeight: 600 }}>{success}</div> : null}
          </div>
        )}
      </div>
    </PageShell>
  )
}

export default HomeWorkConsultantPage
