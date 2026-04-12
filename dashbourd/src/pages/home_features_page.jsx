import { useCallback, useEffect, useState } from 'react'
import { apiRequest, getApiBaseUrl } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiSave, FiTrash2, FiPlus } from 'react-icons/fi'

function normalizeItem(row, index) {
  return {
    layout: row.layout === 'wide' ? 'wide' : 'compact',
    title: row.title ?? '',
    description: row.description ?? '',
    imageUrl: row.imageUrl ?? '',
    sortOrder: Number.isFinite(row.sortOrder) ? row.sortOrder : index,
  }
}

async function uploadImageFile(file, token) {
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

export function HomeFeaturesPage() {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionSubtitle, setSectionSubtitle] = useState('')
  const [items, setItems] = useState([])
  const [uploadingIndex, setUploadingIndex] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/home-features')
      setSectionTitle(data.sectionTitle || '')
      setSectionSubtitle(data.sectionSubtitle || '')
      const list = Array.isArray(data.items) ? data.items : []
      setItems(list.map(normalizeItem).sort((a, b) => a.sortOrder - b.sortOrder))
    } catch (err) {
      setError(err?.message || 'فشل تحميل البيانات')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function updateItem(index, patch) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  function addItem(layout) {
    setItems((prev) => {
      const nextOrder = prev.length ? Math.max(...prev.map((p) => p.sortOrder)) + 1 : 0
      return [...prev, { layout, title: '', description: '', imageUrl: '', sortOrder: nextOrder }]
    })
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function onPickFile(index, file) {
    if (!file || !token) return
    setError(null)
    setUploadingIndex(index)
    try {
      const url = await uploadImageFile(file, token)
      updateItem(index, { imageUrl: url })
    } catch (err) {
      setError(err?.message || 'فشل رفع الصورة')
    } finally {
      setUploadingIndex(null)
    }
  }

  async function save() {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        sectionTitle,
        sectionSubtitle,
        items: items.map((it, i) => ({
          ...it,
          sortOrder: Number.isFinite(it.sortOrder) ? it.sortOrder : i,
        })),
      }
      await apiRequest('/v1/home-features', { method: 'PUT', token, body: payload })
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
      title="قسم الميزات (الرئيسية)"
      subtitle="العنوان، الوصف، وبطاقات الميزات كما تظهر في الصفحة الرئيسية."
    >
      <div className="dash-card">
        {isLoading ? (
          <div className="dash-subtitle">جارٍ التحميل…</div>
        ) : (
          <div className="home-features-editor" style={{ display: 'grid', gap: 24 }}>
            <section style={{ display: 'grid', gap: 12 }}>
              <h3 className="dash-title" style={{ fontSize: 18, margin: 0 }}>رأس القسم</h3>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">العنوان</label>
                <input
                  className="form-input"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="اكتشف قوة ميزاتنا"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">الوصف تحت العنوان</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={sectionSubtitle}
                  onChange={(e) => setSectionSubtitle(e.target.value)}
                  style={{ resize: 'vertical', minHeight: 72 }}
                />
              </div>
            </section>

            <section style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <h3 className="dash-title" style={{ fontSize: 18, margin: 0, flex: 1 }}>البطاقات</h3>
                <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" onClick={() => addItem('compact')}>
                  <FiPlus /> بطاقة صغيرة (صف علوي)
                </button>
                <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" onClick={() => addItem('wide')}>
                  <FiPlus /> بطاقة عريضة (صف سفلي)
                </button>
              </div>

              {items.map((it, index) => (
                <div
                  key={`${it.sortOrder}-${index}`}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'grid',
                    gap: 12,
                    background: 'var(--panel-2)',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>#{index + 1}</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="form-label" style={{ margin: 0 }}>النوع</span>
                      <select
                        className="form-select filter-select"
                        value={it.layout}
                        onChange={(e) => updateItem(index, { layout: e.target.value })}
                        style={{ minWidth: 160 }}
                      >
                        <option value="compact">مضغوط (صفين أعلى)</option>
                        <option value="wide">عريض (صف كامل)</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="form-label" style={{ margin: 0 }}>الترتيب</span>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: 88 }}
                        value={it.sortOrder}
                        onChange={(e) => updateItem(index, { sortOrder: Number(e.target.value) })}
                      />
                    </label>
                    <button
                      type="button"
                      className="dash-btn dash-btn-ghost dash-btn-sm"
                      style={{ marginInlineStart: 'auto' }}
                      onClick={() => removeItem(index)}
                    >
                      <FiTrash2 /> حذف
                    </button>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">عنوان البطاقة</label>
                    <input
                      className="form-input"
                      value={it.title}
                      onChange={(e) => updateItem(index, { title: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">الوصف</label>
                    <textarea
                      className="form-input"
                      rows={4}
                      value={it.description}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">صورة (رابط أو رفع)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                      <input
                        className="form-input"
                        style={{ flex: 1, minWidth: 200 }}
                        placeholder="https://… أو /uploads/…"
                        value={it.imageUrl}
                        onChange={(e) => updateItem(index, { imageUrl: e.target.value })}
                      />
                      <label className="file-upload-btn" style={{ cursor: uploadingIndex === index ? 'wait' : 'pointer' }}>
                        {uploadingIndex === index ? 'جارٍ الرفع…' : 'رفع صورة'}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          disabled={uploadingIndex === index}
                          onChange={(e) => onPickFile(index, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                    {it.imageUrl ? (
                      <img src={it.imageUrl} alt="" style={{ maxWidth: 200, maxHeight: 120, borderRadius: 8, marginTop: 8, objectFit: 'cover' }} />
                    ) : null}
                  </div>
                </div>
              ))}

              {!items.length ? (
                <p className="dash-subtitle">لا توجد بطاقات. أضف بطاقة أو احفظ الافتراضيات من الواجهة العامة بعد أول تحميل.</p>
              ) : null}
            </section>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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

export default HomeFeaturesPage
