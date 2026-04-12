import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'

export function PagesPage() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const sorted = useMemo(() => [...items].sort((a, b) => a.id - b.id), [items])

  async function refresh() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/pages')
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Failed to load pages')
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
      title="الصفحات"
      subtitle="عرض عام، إدارة للمسؤول."
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <div className="dash-card">
          <div className="dash-card__label">إنشاء صفحة</div>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setIsCreating(true)
              setError(null)
              try {
                await apiRequest('/v1/pages', {
                  method: 'POST',
                  token,
                  body: { slug, title, content },
                })
                setSlug('')
                setTitle('')
                setContent('')
                await refresh()
              } catch (err) {
                setError(err?.message || 'Failed to create page')
              } finally {
                setIsCreating(false)
              }
            }}
            style={{ display: 'grid', gap: 10, marginTop: 10 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                placeholder="المسار (مثال: about-us)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
              <input
                placeholder="العنوان"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            </div>
            <textarea
              placeholder="المحتوى"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }}
            />
            <button
              type="submit"
              disabled={isCreating}
              style={{
                padding: 10,
                borderRadius: 12,
                border: 0,
                background: '#0f172a',
                color: '#fff',
                fontWeight: 800,
                cursor: isCreating ? 'not-allowed' : 'pointer',
                opacity: isCreating ? 0.75 : 1,
              }}
            >
              {isCreating ? 'جارٍ الإنشاء…' : 'إنشاء'}
            </button>
          </form>
          {error ? <div style={{ marginTop: 10, color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}
        </div>

        <div className="dash-card">
          <div className="dash-card__label">كل الصفحات</div>
          {isLoading ? (
            <div style={{ marginTop: 10, color: '#475569' }}>جارٍ التحميل…</div>
          ) : (
            <div style={{ marginTop: 10, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 6px' }}>المعرف</th>
                    <th style={{ padding: '8px 6px' }}>المسار</th>
                    <th style={{ padding: '8px 6px' }}>العنوان</th>
                    <th style={{ padding: '8px 6px' }} />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p) => (
                    <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 6px' }}>{p.id}</td>
                      <td style={{ padding: '8px 6px' }}>{p.slug}</td>
                      <td style={{ padding: '8px 6px' }}>{p.title}</td>
                      <td style={{ padding: '8px 6px' }}>
                        <button
                          type="button"
                          className="dash-link"
                          onClick={async () => {
                            if (!confirm(`حذف الصفحة رقم ${p.id}؟`)) return
                            try {
                              await apiRequest(`/v1/pages/${p.id}`, { method: 'DELETE', token })
                              await refresh()
                            } catch (err) {
                              setError(err?.message || 'فشل حذف الصفحة')
                            }
                          }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!sorted.length ? <div style={{ marginTop: 10, color: '#64748b' }}>لا توجد صفحات</div> : null}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}

