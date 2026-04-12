import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiEye, FiFileText, FiTrash2 } from 'react-icons/fi'

const STATUS_LABELS = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  done: 'مكتمل',
  rejected: 'مرفوض',
}

function cellTruncateStyle(maxPx) {
  return {
    padding: '8px 6px',
    maxWidth: maxPx,
    verticalAlign: 'top',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }
}

const iconBtn = {
  background: 'none',
  border: 'none',
  padding: 6,
  cursor: 'pointer',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
}

export function ContactsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const statuses = ['pending', 'processing', 'done', 'rejected']
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [notesText, setNotesText] = useState('')
  const [notesId, setNotesId] = useState(null)
  const [detailsContact, setDetailsContact] = useState(null)

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [items],
  )

  async function refresh() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/contacts?limit=50&offset=0', { token })
      setItems(Array.isArray(data) ? data : [])
      try {
        await apiRequest('/v1/contacts/notifications/mark-seen', { method: 'POST', token, body: {} })
        setItems((rows) =>
          rows.map((x) => ({ ...x, seenByAdminAt: x.seenByAdminAt || new Date().toISOString() })),
        )
      } catch {
        /* bell count may stay until next poll; list is still valid */
      }
    } catch (err) {
      setError(err?.message || 'Failed to load contact requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageShell
      title="جهات الاتصال"
      subtitle="للمسؤول فقط. عرض طلبات التواصل القادمة من الموقع العام."
    >
      <div className="dash-card">
        <div className="dash-card__label">طلبات التواصل</div>
        {error ? <div style={{ marginTop: 10, color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}
        {isLoading ? (
          <div style={{ marginTop: 10, color: '#475569' }}>جارٍ التحميل…</div>
        ) : (
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '8px 6px', width: 72 }}>المعرف</th>
                  <th style={{ padding: '8px 6px', width: 100 }}>رقم الطلب</th>
                  <th style={{ padding: '8px 6px' }}>الاسم</th>
                  <th style={{ padding: '8px 6px' }}>الهاتف</th>
                  <th style={{ padding: '8px 6px', width: 160 }}>الحالة</th>
                  <th style={{ padding: '8px 6px' }}>التاريخ</th>
                  <th style={{ padding: '8px 6px', width: 120, whiteSpace: 'nowrap' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr
                    key={c.id}
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      boxShadow: c.seenByAdminAt ? undefined : 'inset 3px 0 0 0 var(--color-gold, #b8860b)',
                    }}
                  >
                    <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>{c.id}</td>
                    <td style={{ padding: '8px 6px', fontFamily: 'monospace', verticalAlign: 'top', wordBreak: 'break-all' }}>{c.trackingCode}</td>
                    <td style={{ ...cellTruncateStyle(200) }} title={`${c.firstName} ${c.secondName}`}>
                      {c.firstName} {c.secondName}
                    </td>
                    <td style={{ ...cellTruncateStyle(140) }} title={c.phoneNumber}>
                      {c.phoneNumber}
                    </td>
                    <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                      <select
                        value={c.status || 'pending'}
                        disabled={updatingId === c.id}
                        onChange={async (e) => {
                          const next = e.target.value
                          setUpdatingId(c.id)
                          setError(null)
                          try {
                            await apiRequest(`/v1/contacts/${c.id}`, {
                              method: 'PUT',
                              token,
                              body: { status: next },
                            })
                            await refresh()
                          } catch (err) {
                            setError(err?.message || 'فشل تحديث الحالة')
                          } finally {
                            setUpdatingId(null)
                          }
                        }}
                        style={{ padding: 6, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 140, maxWidth: '100%' }}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s] || s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ ...cellTruncateStyle(160) }} title={new Date(c.createdAt).toLocaleString()}>
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                      <div
                        className="contacts-row-actions"
                        style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'flex-start' }}
                      >
                        <button
                          type="button"
                          title="عرض التفاصيل (النشاط والملاحظات)"
                          aria-label="عرض التفاصيل"
                          onClick={() => setDetailsContact(c)}
                          style={{ ...iconBtn, color: 'var(--dash-accent, #b8860b)' }}
                        >
                          <FiEye size={18} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          title="تعديل الملاحظات"
                          aria-label="تعديل الملاحظات"
                          onClick={() => {
                            setNotesId(c.id)
                            setNotesText(c.notes || '')
                            setIsNotesOpen(true)
                          }}
                          style={{ ...iconBtn, color: '#64748b' }}
                        >
                          <FiFileText size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          title="حذف"
                          aria-label="حذف"
                          onClick={async () => {
                            if (!confirm(`حذف الطلب رقم ${c.id}؟`)) return
                            try {
                              await apiRequest(`/v1/contacts/${c.id}`, { method: 'DELETE', token })
                              await refresh()
                            } catch (err) {
                              setError(err?.message || 'فشل حذف الطلب')
                            }
                          }}
                          style={{ ...iconBtn, color: '#64748b' }}
                        >
                          <FiTrash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!sorted.length ? <div style={{ marginTop: 10, color: '#64748b' }}>لا توجد طلبات</div> : null}
          </div>
        )}
      </div>

      {/* Details (read-only) */}
      {detailsContact ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-details-title"
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
          onClick={() => setDetailsContact(null)}
        >
          <div
            className="dash-card"
            style={{ width: 'min(640px, 96vw)', maxHeight: 'min(85vh, 720px)', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dash-card__label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <span id="contact-details-title">تفاصيل الطلب #{detailsContact.id}</span>
              <button type="button" className="dash-link" onClick={() => setDetailsContact(null)}>
                إغلاق
              </button>
            </div>
            <div
              style={{
                marginTop: 12,
                overflow: 'auto',
                display: 'grid',
                gap: 14,
                paddingRight: 4,
              }}
            >
              <dl style={{ margin: 0, display: 'grid', gap: 10, gridTemplateColumns: 'auto 1fr', columnGap: 12, rowGap: 8, alignItems: 'start' }}>
                <dt style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>رقم التتبع</dt>
                <dd style={{ margin: 0, fontFamily: 'monospace', wordBreak: 'break-all' }}>{detailsContact.trackingCode}</dd>
                <dt style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>الاسم</dt>
                <dd style={{ margin: 0, wordBreak: 'break-word' }}>
                  {detailsContact.firstName} {detailsContact.secondName}
                </dd>
                <dt style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>الهاتف</dt>
                <dd style={{ margin: 0, wordBreak: 'break-all' }}>{detailsContact.phoneNumber}</dd>
                <dt style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>الحالة</dt>
                <dd style={{ margin: 0 }}>{STATUS_LABELS[detailsContact.status] || detailsContact.status}</dd>
                <dt style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>التاريخ</dt>
                <dd style={{ margin: 0 }}>{new Date(detailsContact.createdAt).toLocaleString()}</dd>
              </dl>
              <div>
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 6 }}>النشاط</div>
                <div
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.5,
                    padding: '10px 12px',
                    background: 'var(--dash-surface-2, #f8fafc)',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    maxHeight: 220,
                    overflow: 'auto',
                  }}
                >
                  {detailsContact.activity || '—'}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 6 }}>ملاحظات</div>
                <div
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.5,
                    padding: '10px 12px',
                    background: 'var(--dash-surface-2, #f8fafc)',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    maxHeight: 220,
                    overflow: 'auto',
                  }}
                >
                  {detailsContact.notes?.trim() ? detailsContact.notes : '—'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: 4 }}>
                <button
                  type="button"
                  className="dash-link"
                  onClick={() => {
                    setNotesId(detailsContact.id)
                    setNotesText(detailsContact.notes || '')
                    setDetailsContact(null)
                    setIsNotesOpen(true)
                  }}
                >
                  تعديل الملاحظات
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Notes Modal */}
      {isNotesOpen ? (
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
          onClick={() => setIsNotesOpen(false)}
        >
          <div
            className="dash-card"
            style={{ width: 'min(700px, 96vw)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dash-card__label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              تعديل الملاحظات للطلب رقم {notesId}
              <button type="button" className="dash-link" onClick={() => setIsNotesOpen(false)}>✖ إغلاق</button>
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
              <textarea
                placeholder="اكتب ملاحظاتك هنا"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={6}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="dash-link" onClick={() => setIsNotesOpen(false)}>
                  إلغاء
                </button>
                <button
                  type="button"
                  className="dash-link"
                  onClick={async () => {
                    if (!notesId) return
                    setUpdatingId(notesId)
                    setError(null)
                    try {
                      await apiRequest(`/v1/contacts/${notesId}`, {
                        method: 'PUT',
                        token,
                        body: { notes: notesText },
                      })
                      setIsNotesOpen(false)
                      await refresh()
                    } catch (err) {
                      setError(err?.message || 'فشل تحديث الملاحظات')
                    } finally {
                      setUpdatingId(null)
                    }
                  }}
                  disabled={updatingId === notesId}
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}

