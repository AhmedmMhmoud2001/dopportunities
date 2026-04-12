import { useEffect, useMemo, useState } from 'react'
import { apiRequest, getApiBaseUrl, resolvePublicUploadUrl, normalizeImageUrlForStorage } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'

export function ServicesPage() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal + form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const sorted = useMemo(() => [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)), [items])

  async function refresh() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/services', { token })
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Failed to load services')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetForm() {
    setTitle('')
    setSlug('')
    setDescription('')
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

  function openEditModal(svc) {
    setEditingId(svc.id)
    setTitle(svc.title || '')
    setSlug(svc.slug || '')
    setDescription(svc.description || '')
    setImageUrl(svc.imageUrl ? resolvePublicUploadUrl(svc.imageUrl) : '')
    setImageFile(null)
    setSortOrder(Number(svc.sortOrder) || 0)
    setIsActive(Boolean(svc.isActive))
    setIsModalOpen(true)
  }

  function isValidImage(file) {
    const maxBytes = 5 * 1024 * 1024 // 5MB
    const okType = /^image\//.test(file.type)
    return okType && file.size <= maxBytes
  }

  async function uploadImage(file) {
    if (!file) return null
    if (!isValidImage(file)) {
      setError('صورة غير صالحة. المسموح: صور حتى 5 ميجابايت.')
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
          } catch {
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
        title,
        slug,
        description,
        imageUrl: normalizeImageUrlForStorage(imageUrlToUse),
        sortOrder: Number(sortOrder) || 0,
        isActive: Boolean(isActive),
      }
      if (editingId) {
        await apiRequest(`/v1/services/${editingId}`, { method: 'PUT', token, body: payload })
      } else {
        await apiRequest('/v1/services', { method: 'POST', token, body: payload })
      }
      setIsModalOpen(false)
      resetForm()
      await refresh()
    } catch (err) {
      setError(err?.message || (editingId ? 'Failed to update service' : 'Failed to create service'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell
      title="الخدمات"
      subtitle="عرض عام (النشطة فقط)، إدارة للمسؤول."
      right={
        <button type="button" className="dash-btn" onClick={openCreateModal}>
          + جديد
        </button>
      }
    >
      <div style={{ display: 'grid', gap: 12 }}>
        {error ? <div className="dash-card" style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}

        <div className="dash-card">
          <div className="dash-card__label">الخدمات</div>
          {isLoading ? (
            <div className="dash-services-table__hint">جارٍ التحميل…</div>
          ) : (
            <div className="table-container dash-services-table__wrap">
              <table className="dash-table dash-services-table">
                <thead>
                  <tr>
                    <th scope="col">المعرف</th>
                    <th scope="col">الصورة</th>
                    <th scope="col">العنوان</th>
                    <th scope="col">المسار</th>
                    <th scope="col">الترتيب</th>
                    <th scope="col">نشط</th>
                    <th scope="col">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>
                        {s.imageUrl ? (
                          <img
                            src={resolvePublicUploadUrl(s.imageUrl)}
                            alt=""
                            className="dash-services-table__thumb"
                          />
                        ) : (
                          <span className="dash-services-table__empty-cell">—</span>
                        )}
                      </td>
                      <td className="dash-services-table__title">{s.title}</td>
                      <td>
                        <code className="dash-services-table__slug">{s.slug}</code>
                      </td>
                      <td>{s.sortOrder}</td>
                      <td>
                        {s.isActive ? (
                          <span className="dash-badge dash-badge--success">نعم</span>
                        ) : (
                          <span className="dash-badge dash-badge--danger">لا</span>
                        )}
                      </td>
                      <td>
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
                              if (!confirm(`حذف الخدمة رقم ${s.id}؟`)) return
                              try {
                                await apiRequest(`/v1/services/${s.id}`, { method: 'DELETE', token })
                                await refresh()
                              } catch (err) {
                                setError(err?.message || 'فشل حذف الخدمة')
                              }
                            }}
                            className="dash-table-action-btn dash-table-action-btn--danger"
                          >
                            <FiTrash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!sorted.length ? <div className="dash-services-table__hint">لا توجد خدمات</div> : null}
            </div>
          )}
        </div>

        {/* Modal */}
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
                {editingId ? `تعديل الخدمة رقم ${editingId}` : 'إنشاء خدمة'}
                <button type="button" className="dash-link" onClick={() => setIsModalOpen(false)}>✖ إغلاق</button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input
                    placeholder="العنوان"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
                  />
                  <input
                    placeholder="المسار"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <textarea
                  placeholder="الوصف"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 140px 140px', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                    {/* Preview */}
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
                        id="service-photo-input"
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
                      <label htmlFor="service-photo-input" className="dash-btn dash-btn-secondary dash-btn-sm">
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
                    disabled={isSaving}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: 0,
                      background: '#0f172a',
                      color: '#fff',
                      fontWeight: 800,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.75 : 1,
                    }}
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

export default ServicesPage
