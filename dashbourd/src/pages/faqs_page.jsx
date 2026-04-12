import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'

export function FaqsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const isRtl = typeof document !== 'undefined' && document.documentElement?.dir === 'rtl'

  // Modal + form state
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const sorted = useMemo(() => [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)), [items])

  async function refresh() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/faqs')
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Failed to load FAQs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetForm() {
    setQuestion('')
    setAnswer('')
    setSortOrder(0)
    setIsActive(true)
    setEditingId(null)
  }

  function openCreateModal() {
    resetForm()
    setIsModalOpen(true)
  }

  function openEditModal(faq) {
    setEditingId(faq.id)
    setQuestion(faq.question || '')
    setAnswer(faq.answer || '')
    setSortOrder(Number(faq.sortOrder) || 0)
    setIsActive(Boolean(faq.isActive))
    setIsModalOpen(true)
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    setIsSaving(true)
    setError(null)
    try {
      const payload = {
        question,
        answer,
        sortOrder: Number(sortOrder) || 0,
        isActive: Boolean(isActive),
      }
      if (editingId) {
        await apiRequest(`/v1/faqs/${editingId}`, { method: 'PUT', token, body: payload })
      } else {
        await apiRequest('/v1/faqs', { method: 'POST', token, body: payload })
      }
      setIsModalOpen(false)
      resetForm()
      await refresh()
    } catch (err) {
      setError(err?.message || (editingId ? 'Failed to update FAQ' : 'Failed to create FAQ'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell
      title="الأسئلة الشائعة"
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
          <div className="dash-card__label">الأسئلة الشائعة</div>
          {isLoading ? (
            <div style={{ marginTop: 10, color: '#475569' }}>جارٍ التحميل…</div>
          ) : (
            <div style={{ marginTop: 10, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: isRtl ? 'right' : 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 6px' }}>المعرف</th>
                    <th style={{ padding: '8px 6px' }}>السؤال</th>
                    <th style={{ padding: '8px 6px' }}>الترتيب</th>
                    <th style={{ padding: '8px 6px' }}>نشط</th>
                    <th style={{ padding: '8px 6px' }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((f) => (
                    <tr key={f.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 6px' }}>{f.id}</td>
                      <td style={{ padding: '8px 6px' }}>{f.question}</td>
                      <td style={{ padding: '8px 6px' }}>{f.sortOrder}</td>
                      <td style={{ padding: '8px 6px' }}>{Boolean(f.isActive) ? 'نعم' : 'لا'}</td>
                      <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                        <div
                          className="dash-table-actions"
                          style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
                        >
                          <button
                            type="button"
                            title="تعديل"
                            aria-label="تعديل"
                            onClick={() => openEditModal(f)}
                            className="dash-table-action-btn"
                          >
                            <FiEdit2 size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            title="حذف"
                            aria-label="حذف"
                            onClick={async () => {
                              if (!confirm(`حذف السؤال رقم ${f.id}؟`)) return
                              try {
                                await apiRequest(`/v1/faqs/${f.id}`, { method: 'DELETE', token })
                                await refresh()
                              } catch (err) {
                                setError(err?.message || 'فشل حذف السؤال')
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
              {!sorted.length ? <div style={{ marginTop: 10, color: '#64748b' }}>لا توجد أسئلة</div> : null}
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
              style={{ width: 'min(800px, 96vw)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dash-card__label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {editingId ? `تعديل السؤال رقم ${editingId}` : 'إنشاء سؤال'}
                <button type="button" className="dash-link" onClick={() => setIsModalOpen(false)}>✖ إغلاق</button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                <input
                  placeholder="السؤال"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
                />
                <textarea
                  placeholder="الإجابة"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  required
                  style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, alignItems: 'center' }}>
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

