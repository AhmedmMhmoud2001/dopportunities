import { useEffect, useState } from 'react'
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

export function SiteBrandingPage() {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploading, setUploading] = useState(null)
  const [headerLogoUrl, setHeaderLogoUrl] = useState('')
  const [footerLogoUrl, setFooterLogoUrl] = useState('')

  async function load() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/site-branding')
      setHeaderLogoUrl(data.headerLogoUrl ? String(data.headerLogoUrl) : '')
      setFooterLogoUrl(data.footerLogoUrl ? String(data.footerLogoUrl) : '')
    } catch (err) {
      setError(err?.message || 'فشل التحميل')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleUpload(kind, file) {
    if (!file || !token) return
    setError(null)
    setUploading(kind)
    try {
      const url = await uploadPublicFile(file, token)
      if (kind === 'header') setHeaderLogoUrl(url)
      if (kind === 'footer') setFooterLogoUrl(url)
    } catch (err) {
      setError(err?.message || 'فشل الرفع')
    } finally {
      setUploading(null)
    }
  }

  async function save(e) {
    e?.preventDefault?.()
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await apiRequest('/v1/site-branding', {
        method: 'PUT',
        token,
        body: {
          headerLogoUrl: headerLogoUrl?.trim() || null,
          footerLogoUrl: footerLogoUrl?.trim() || null,
        },
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
      title="شعارات الموقع"
      subtitle="شعار الهيدر والفوتر في النسخة العامة (opportunities-maker-2). اتركهما فارغين لاستخدام الصور الافتراضية في الكود."
    >
      <div className="dash-card">
        {isLoading ? (
          <div className="dash-subtitle">جارٍ التحميل…</div>
        ) : (
          <form onSubmit={save} style={{ display: 'grid', gap: 20, marginTop: 8 }}>
            <div>
              <label className="dash-card__label" style={{ display: 'block', marginBottom: 6 }}>
                شعار الهيدر
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <input
                  className="form-input"
                  type="url"
                  inputMode="url"
                  placeholder="https://أو مسار بعد الرفع"
                  value={headerLogoUrl}
                  onChange={(e) => setHeaderLogoUrl(e.target.value)}
                  style={{ flex: '1 1 240px', minWidth: 0 }}
                />
                <label
                  className="file-upload-btn"
                  style={{ cursor: uploading === 'header' ? 'wait' : 'pointer' }}
                >
                  <FiImage style={{ marginInlineEnd: 6 }} />
                  {uploading === 'header' ? '…' : 'رفع صورة'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading === 'header'}
                    onChange={(e) => handleUpload('header', e.target.files?.[0])}
                  />
                </label>
              </div>
              {headerLogoUrl ? (
                <img src={headerLogoUrl} alt="" style={{ maxWidth: 180, marginTop: 8, borderRadius: 8 }} />
              ) : null}
            </div>

            <div>
              <label className="dash-card__label" style={{ display: 'block', marginBottom: 6 }}>
                شعار الفوتر
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <input
                  className="form-input"
                  type="url"
                  inputMode="url"
                  placeholder="https://أو مسار بعد الرفع"
                  value={footerLogoUrl}
                  onChange={(e) => setFooterLogoUrl(e.target.value)}
                  style={{ flex: '1 1 240px', minWidth: 0 }}
                />
                <label className="file-upload-btn" style={{ cursor: uploading === 'footer' ? 'wait' : 'pointer' }}>
                  <FiImage style={{ marginInlineEnd: 6 }} />
                  {uploading === 'footer' ? '…' : 'رفع صورة'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading === 'footer'}
                    onChange={(e) => handleUpload('footer', e.target.files?.[0])}
                  />
                </label>
              </div>
              {footerLogoUrl ? (
                <img src={footerLogoUrl} alt="" style={{ maxWidth: 180, marginTop: 8, borderRadius: 8 }} />
              ) : null}
            </div>

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
