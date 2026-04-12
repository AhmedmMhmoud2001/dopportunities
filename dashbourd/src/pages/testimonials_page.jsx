import { useEffect, useMemo, useState } from 'react'
import { apiRequest, getApiBaseUrl, resolvePublicUploadUrl, normalizeImageUrlForStorage } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiEdit2, FiTrash2, FiSave } from 'react-icons/fi'

export function TestimonialsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [name, setName] = useState('')
  const [quote, setQuote] = useState('')
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionDescription, setSectionDescription] = useState('')
  const [sectionSaving, setSectionSaving] = useState(false)
  const [sectionSuccess, setSectionSuccess] = useState(null)

  const sorted = useMemo(() => [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)), [items])

  async function refresh() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/testimonials')
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'فشل تحميل الشهادات')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadSection() {
    try {
      const s = await apiRequest('/v1/testimonials/section')
      setSectionTitle(typeof s?.sectionTitle === 'string' ? s.sectionTitle : '')
      setSectionDescription(typeof s?.sectionDescription === 'string' ? s.sectionDescription : '')
    } catch {
      /* يبقى فارغاً أو القيم السابقة */
    }
  }

  async function saveSection(e) {
    e?.preventDefault?.()
    setSectionSaving(true)
    setError(null)
    setSectionSuccess(null)
    try {
      await apiRequest('/v1/testimonials/section', {
        method: 'PUT',
        token,
        body: {
          sectionTitle: sectionTitle.trim(),
          sectionDescription,
        },
      })
      setSectionSuccess('تم حفظ عنوان ووصف القسم')
      await loadSection()
    } catch (err) {
      setError(err?.message || 'فشل حفظ إعدادات القسم')
    } finally {
      setSectionSaving(false)
    }
  }

  useEffect(() => {
    refresh()
    loadSection()
  }, [])

  function resetForm() {
    setName('')
    setQuote('')
    setText('')
    setImageUrl('')
    setImageFile(null)
    setSortOrder(0)
    setIsActive(true)
    setEditingId(null)
  }

  function openCreateModal() {
    resetForm()
    setIsModalOpen(true)
  }

  function openEditModal(item) {
    setEditingId(item.id)
    setName(item.name || '')
    setQuote(item.quote || '')
    setText(item.text || '')
    setImageUrl(item.imageUrl ? resolvePublicUploadUrl(item.imageUrl) : '')
    setImageFile(null)
    setSortOrder(Number(item.sortOrder) || 0)
    setIsActive(Boolean(item.isActive))
    setIsModalOpen(true)
  }

  function isValidImage(file) {
    const maxBytes = 5 * 1024 * 1024
    const okType = /^image\//.test(file.type)
    return okType && file.size <= maxBytes
  }

  async function uploadImage(file) {
    if (!file) return null
    if (!isValidImage(file)) {
      setError('صورة غير صالحة. المسموح: صور حتى 5MB.')
      return null
    }
    setError(null)
    setIsUploading(true)
    setUploadProgress(0)
    const form = new FormData()
    form.append('file', file)
    const uploadUrl = `${getApiBaseUrl()}/v1/uploads`
    try {
      const resolved = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', uploadUrl, true)
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        }
        xhr.onload = () => {
          try {
            const data = xhr.responseText ? JSON.parse(xhr.responseText) : {}
            if (xhr.status >= 200 && xhr.status < 300) {
              const path = data?.url
              if (!path || typeof path !== 'string') {
                reject(new Error('استجابة الرفع بدون مسار'))
                return
              }
              resolve(resolvePublicUploadUrl(path))
            } else {
              reject(new Error(data?.message || xhr.responseText || 'فشل الرفع'))
            }
          } catch (parseErr) {
            reject(new Error(xhr.responseText || 'فشل الرفع'))
          }
        }
        xhr.onerror = () => reject(new Error('فشل الاتصال أثناء الرفع'))
        xhr.send(form)
      })
      setImageUrl(resolved)
      setImageFile(null)
      return resolved
    } catch (err) {
      setError(err?.message || 'فشل الرفع')
      return null
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    setIsSaving(true)
    setError(null)
    try {
      let imageUrlToUse = (imageUrl && String(imageUrl).trim()) || null
      if (!imageUrlToUse && imageFile) {
        imageUrlToUse = await uploadImage(imageFile)
      }
      const payload = {
        name,
        quote: quote || null,
        text,
        imageUrl: normalizeImageUrlForStorage(imageUrlToUse),
        sortOrder: Number(sortOrder) || 0,
        isActive: Boolean(isActive),
      }
      if (editingId) {
        await apiRequest(`/v1/testimonials/${editingId}`, { method: 'PUT', token, body: payload })
      } else {
        await apiRequest('/v1/testimonials', { method: 'POST', token, body: payload })
      }
      setIsModalOpen(false)
      resetForm()
      await refresh()
    } catch (err) {
      setError(err?.message || (editingId ? 'فشل تحديث الشهادة' : 'فشل إنشاء الشهادة'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell
      title="الشهادات"
      subtitle="عنوان ووصف قسم آراء العملاء في الصفحة الرئيسية، والشهادات (النشطة في الموقع)."
      right={
        <button type="button" className="dash-link" onClick={openCreateModal}>
          + جديد
        </button>
      }
    >
      <div style={{ display: 'grid', gap: 12 }}>
        {error ? <div className="dash-card" style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}

        <div className="dash-card">
          <div className="dash-card__label">قسم آراء العملاء (العنوان والوصف)</div>
          <p className="dash-subtitle" style={{ marginTop: 8, marginBottom: 12 }}>
            يظهران بجانب السلايدر في الصفحة الرئيسية.
          </p>
          <form onSubmit={saveSection} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label className="dash-card__label" style={{ display: 'block', marginBottom: 6 }}>عنوان القسم</label>
              <input
                className="form-input"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="# آراء عملائنا"
              />
            </div>
            <div>
              <label className="dash-card__label" style={{ display: 'block', marginBottom: 6 }}>الوصف</label>
              <textarea
                className="form-input"
                rows={4}
                value={sectionDescription}
                onChange={(e) => setSectionDescription(e.target.value)}
                placeholder="نص تعريفي قصير عن آراء العملاء…"
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="submit" className="dash-btn dash-btn-primary dash-btn-sm" disabled={sectionSaving}>
                <FiSave size={16} />
                {sectionSaving ? 'جارٍ الحفظ…' : 'حفظ العنوان والوصف'}
              </button>
              {sectionSuccess ? <span style={{ color: '#15803d', fontWeight: 700 }}>{sectionSuccess}</span> : null}
            </div>
          </form>
        </div>

        <div className="dash-card">
          <div className="dash-card__label">الشهادات</div>
          {isLoading ? (
            <div style={{ marginTop: 10, color: '#475569' }}>جارٍ التحميل…</div>
          ) : (
            <div style={{ marginTop: 10, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 6px' }}>المعرف</th>
                    <th style={{ padding: '8px 6px' }}>الصورة</th>
                    <th style={{ padding: '8px 6px' }}>الاسم</th>
                    <th style={{ padding: '8px 6px' }}>اقتباس</th>
                    <th style={{ padding: '8px 6px' }}>الترتيب</th>
                    <th style={{ padding: '8px 6px' }}>نشط</th>
                    <th style={{ padding: '8px 6px' }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s) => (
                    <tr key={s.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 6px' }}>{s.id}</td>
                      <td style={{ padding: '8px 6px' }}>
                        {s.imageUrl ? (
                          <img
                            src={resolvePublicUploadUrl(s.imageUrl)}
                            alt=""
                            style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }}
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{ padding: '8px 6px' }}>{s.name}</td>
                      <td style={{ padding: '8px 6px' }}>{s.quote || '—'}</td>
                      <td style={{ padding: '8px 6px' }}>{s.sortOrder}</td>
                      <td style={{ padding: '8px 6px' }}>{String(Boolean(s.isActive))}</td>
                      <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                        <div className="dash-table-actions">
                          <button
                            type="button"
                            title="تعديل"
                            aria-label="تعديل"
                            onClick={() => openEditModal(s)}
                            className="dash-table-action-btn"
                          >
                            <FiEdit2 size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            title="حذف"
                            aria-label="حذف"
                            onClick={async () => {
                              if (!confirm(`حذف الشهادة رقم ${s.id}؟`)) return
                              try {
                                await apiRequest(`/v1/testimonials/${s.id}`, { method: 'DELETE', token })
                                await refresh()
                              } catch (err) {
                                setError(err?.message || 'فشل حذف الشهادة')
                              }
                            }}
                            className="dash-table-action-btn"
                          >
                            <FiTrash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!sorted.length ? <div style={{ marginTop: 10, color: '#64748b' }}>لا توجد شهادات</div> : null}
            </div>
          )}
        </div>

        {isModalOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15,23,42,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 16,
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="dash-card"
              style={{ width: 'min(900px, 96vw)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dash-card__label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {editingId ? `تعديل الشهادة رقم ${editingId}` : 'إنشاء شهادة'}
                <button type="button" className="dash-link" onClick={() => setIsModalOpen(false)}>✖ إغلاق</button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input
                    placeholder="الاسم"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
                  />
                  <input
                    placeholder="اقتباس (اختياري)"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <textarea
                  placeholder="النص"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  required
                  style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 140px 140px', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                    {imageUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={resolvePublicUploadUrl(imageUrl)} alt="" style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        <button
                          type="button"
                          className="dash-link"
                          onClick={() => { setImageUrl(''); setImageFile(null); }}
                          title="إزالة الصورة"
                          aria-label="إزالة الصورة"
                        >
                          إزالة
                        </button>
                      </div>
                    ) : null}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        id="testimonial-photo-input"
                        type="file"
                        accept="image/*"
                        className="dash-sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null
                          setImageFile(f)
                          if (f) uploadImage(f)
                          e.target.value = ''
                        }}
                      />
                      <label htmlFor="testimonial-photo-input" className="dash-btn dash-btn-secondary dash-btn-sm">
                        رفع صورة
                      </label>
                      {isUploading ? (
                        <div style={{ minWidth: 160, color: '#475569' }} aria-live="polite">
                          جارٍ الرفع… {uploadProgress}%
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <input
                    placeholder="الترتيب"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    type="number"
                    style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', fontWeight: 700 }}>
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    نشط
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                  <button type="button" className="dash-link" onClick={() => { setIsModalOpen(false); }}>
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="dash-btn dash-btn-primary dash-btn-sm"
                    disabled={isSaving}
                    style={{ cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.75 : 1 }}
                  >
                    {isSaving ? (editingId ? 'جارٍ الحفظ…' : 'جارٍ الإنشاء…') : (editingId ? 'حفظ التغييرات' : 'إنشاء')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </PageShell>
  )
}

export default TestimonialsPage