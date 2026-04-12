import { useCallback, useEffect, useState } from 'react'
import { apiRequest, getApiBaseUrl } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiSave, FiPlus, FiTrash2, FiImage } from 'react-icons/fi'

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

export function HomeIntroPage() {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [stats, setStats] = useState([])
  const [howHeading, setHowHeading] = useState('')
  const [howBody, setHowBody] = useState('')
  const [howVideoUrl, setHowVideoUrl] = useState('')
  const [howPosterUrl, setHowPosterUrl] = useState('')

  const [newStat, setNewStat] = useState({ value: '', label: '', sortOrder: 0 })

  const load = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/home-intro')
      setStats(Array.isArray(data.stats) ? data.stats : [])
      setHowHeading(data.howHeading || '')
      setHowBody(data.howBody || '')
      setHowVideoUrl(data.howVideoUrl || '')
      setHowPosterUrl(data.howPosterUrl || '')
    } catch (err) {
      setError(err?.message || 'فشل التحميل')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function updateStat(index, patch) {
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function addStat() {
    if (!newStat.value.trim() || !newStat.label.trim()) return
    const order = stats.length ? Math.max(...stats.map((s) => s.sortOrder ?? 0)) + 1 : 0
    setStats([...stats, { ...newStat, sortOrder: newStat.sortOrder || order }])
    setNewStat({ value: '', label: '', sortOrder: 0 })
  }

  function removeStat(index) {
    setStats((prev) => prev.filter((_, i) => i !== index))
  }

  async function onPosterUpload(file) {
    if (!file || !token) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadPublicFile(file, token)
      setHowPosterUrl(url)
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
      await apiRequest('/v1/home-intro', {
        method: 'PUT',
        token,
        body: {
          stats: stats.map((s, i) => ({
            value: s.value,
            label: s.label,
            sortOrder: Number.isFinite(s.sortOrder) ? s.sortOrder : i,
          })),
          howHeading,
          howBody,
          howVideoUrl: howVideoUrl.trim() || null,
          howPosterUrl: howPosterUrl.trim() || null,
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
      title="الإحصائيات وكيف نعمل"
      subtitle="عدادات الصفحة الرئيسية وقسم «كيف تعمل خدماتنا» والفيديو."
    >
      <div className="dash-card">
        {isLoading ? (
          <div className="dash-subtitle">جارٍ التحميل…</div>
        ) : (
          <div className="home-intro-editor">
            <section className="home-intro-section">
              <h3 className="home-intro-section__title">بطاقات الأرقام</h3>
              <p className="home-intro-section__hint">
                أمثلة للقيمة: <code>2K</code> أو <code>+300</code> أو <code>10+</code> — يُستخرج الرقم للعدّ التصاعدي على الموقع.
              </p>
              {stats.map((s, i) => (
                <div key={`${i}-${s.label}`} className="home-intro-stat-row">
                  <div className="home-intro-stat-field">
                    <label className="form-label">القيمة</label>
                    <input
                      className="form-input"
                      placeholder="مثال: 2K"
                      value={s.value}
                      onChange={(e) => updateStat(i, { value: e.target.value })}
                    />
                  </div>
                  <div className="home-intro-stat-field">
                    <label className="form-label">التسمية</label>
                    <input
                      className="form-input"
                      placeholder="مثال: عميل"
                      value={s.label}
                      onChange={(e) => updateStat(i, { label: e.target.value })}
                    />
                  </div>
                  <div className="home-intro-stat-field">
                    <label className="form-label">الترتيب</label>
                    <input
                      type="number"
                      className="form-input"
                      value={s.sortOrder ?? i}
                      onChange={(e) => updateStat(i, { sortOrder: Number(e.target.value) })}
                    />
                  </div>
                  <div className="home-intro-stat-actions">
                    <button
                      type="button"
                      className="dash-btn dash-btn-ghost dash-btn-sm"
                      onClick={() => removeStat(i)}
                      aria-label="حذف"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
              <div className="home-intro-stat-row home-intro-stat-row--add">
                <div className="home-intro-stat-field">
                  <label className="form-label">قيمة جديدة</label>
                  <input
                    className="form-input"
                    value={newStat.value}
                    onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
                  />
                </div>
                <div className="home-intro-stat-field">
                  <label className="form-label">تسمية</label>
                  <input
                    className="form-input"
                    value={newStat.label}
                    onChange={(e) => setNewStat({ ...newStat, label: e.target.value })}
                  />
                </div>
                <div className="home-intro-stat-field">
                  <label className="form-label">ترتيب</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newStat.sortOrder}
                    onChange={(e) => setNewStat({ ...newStat, sortOrder: Number(e.target.value) })}
                  />
                </div>
                <div className="home-intro-stat-actions">
                  <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" onClick={addStat}>
                    <FiPlus /> إضافة
                  </button>
                </div>
              </div>
            </section>

            <section className="home-intro-section">
              <h3 className="home-intro-section__title">كيف تعمل خدماتنا</h3>
              <div className="home-intro-stat-field">
                <label className="form-label">العنوان</label>
                <input
                  className="form-input"
                  value={howHeading}
                  onChange={(e) => setHowHeading(e.target.value)}
                />
              </div>
              <div className="home-intro-stat-field">
                <label className="form-label">النص</label>
                <textarea
                  className="form-input"
                  rows={6}
                  value={howBody}
                  onChange={(e) => setHowBody(e.target.value)}
                  style={{ resize: 'vertical', minHeight: 120 }}
                />
              </div>
              <div className="home-intro-stat-field">
                <label className="form-label">رابط الفيديو</label>
                <input
                  className="form-input"
                  placeholder="YouTube أو رابط مباشر لملف .mp4 / .webm"
                  value={howVideoUrl}
                  onChange={(e) => setHowVideoUrl(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">صورة الغلاف</label>
                <div className="home-intro-poster-row">
                  <input
                    className="form-input"
                    placeholder="رابط الصورة"
                    value={howPosterUrl}
                    onChange={(e) => setHowPosterUrl(e.target.value)}
                  />
                  <label className="file-upload-btn" style={{ cursor: uploading ? 'wait' : 'pointer', flexShrink: 0 }}>
                    <FiImage style={{ marginInlineEnd: 6 }} />
                    {uploading ? 'جارٍ الرفع…' : 'رفع صورة'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading}
                      onChange={(e) => onPosterUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
                {howPosterUrl ? (
                  <img src={howPosterUrl} alt="" className="home-intro-poster-preview" loading="lazy" />
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

export default HomeIntroPage
