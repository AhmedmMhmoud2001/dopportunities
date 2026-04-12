import { useEffect, useState } from 'react'
import { apiRequest, getApiBaseUrl } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { FiMapPin, FiSave, FiImage, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi'

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

export function LocationsPage() {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploading, setUploading] = useState(null)

  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionDesc, setSectionDesc] = useState('')
  const [callTitle, setCallTitle] = useState('')
  const [callDesc, setCallDesc] = useState('')
  const [phone, setPhone] = useState('')
  const [workingHours, setWorkingHours] = useState('')
  const [addresses, setAddresses] = useState([])

  const [heroTagline, setHeroTagline] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [mapImageUrl, setMapImageUrl] = useState('')
  const [companySubtitle, setCompanySubtitle] = useState('')

  const [newAddress, setNewAddress] = useState({
    city: '',
    fullAddress: '',
    mapEmbedUrl: '',
    lat: '',
    lng: '',
  })

  /** فهرس العنوان قيد التعديل، أو null */
  const [editingIndex, setEditingIndex] = useState(null)
  const [editDraft, setEditDraft] = useState({
    city: '',
    fullAddress: '',
    mapEmbedUrl: '',
    lat: '',
    lng: '',
  })

  async function load() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/locations')
      setSectionTitle(data.sectionTitle || '')
      setSectionDesc(data.sectionDesc || '')
      setCallTitle(data.callTitle || '')
      setCallDesc(data.callDesc || '')
      setPhone(data.phone || '')
      setWorkingHours(data.workingHours || '')
      setAddresses(Array.isArray(data.addresses) ? data.addresses : [])
      setHeroTagline(data.heroTagline ?? '')
      setLogoUrl(data.logoUrl ?? '')
      setMapImageUrl(data.mapImageUrl ?? '')
      setCompanySubtitle(data.companySubtitle ?? '')
    } catch (err) {
      setError(err?.message || 'فشل تحميل البيانات')
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
      if (kind === 'logo') setLogoUrl(url)
      if (kind === 'map') setMapImageUrl(url)
    } catch (err) {
      setError(err?.message || 'فشل الرفع')
    } finally {
      setUploading(null)
    }
  }

  function addAddress() {
    if (!newAddress.city || !newAddress.fullAddress) return
    const lat = newAddress.lat === '' ? undefined : Number(newAddress.lat)
    const lng = newAddress.lng === '' ? undefined : Number(newAddress.lng)
    setAddresses([
      ...addresses,
      {
        city: newAddress.city,
        fullAddress: newAddress.fullAddress,
        mapEmbedUrl: newAddress.mapEmbedUrl || undefined,
        ...(Number.isFinite(lat) ? { lat } : {}),
        ...(Number.isFinite(lng) ? { lng } : {}),
      },
    ])
    setNewAddress({ city: '', fullAddress: '', mapEmbedUrl: '', lat: '', lng: '' })
  }

  function startEditAddress(index) {
    const a = addresses[index]
    if (!a) return
    setEditingIndex(index)
    setEditDraft({
      city: a.city || '',
      fullAddress: a.fullAddress || '',
      mapEmbedUrl: a.mapEmbedUrl || '',
      lat: a.lat != null && Number.isFinite(Number(a.lat)) ? String(a.lat) : '',
      lng: a.lng != null && Number.isFinite(Number(a.lng)) ? String(a.lng) : '',
    })
  }

  function cancelEditAddress() {
    setEditingIndex(null)
    setEditDraft({ city: '', fullAddress: '', mapEmbedUrl: '', lat: '', lng: '' })
  }

  function saveEditAddress() {
    if (editingIndex == null) return
    if (!editDraft.city?.trim() || !editDraft.fullAddress?.trim()) {
      setError('المدينة والعنوان الكامل مطلوبان للتعديل')
      return
    }
    setError(null)
    const lat = editDraft.lat === '' ? undefined : Number(editDraft.lat)
    const lng = editDraft.lng === '' ? undefined : Number(editDraft.lng)
    const next = {
      city: editDraft.city.trim(),
      fullAddress: editDraft.fullAddress.trim(),
      mapEmbedUrl: editDraft.mapEmbedUrl?.trim() || undefined,
      ...(Number.isFinite(lat) ? { lat } : {}),
      ...(Number.isFinite(lng) ? { lng } : {}),
    }
    setAddresses((prev) => prev.map((row, i) => (i === editingIndex ? next : row)))
    cancelEditAddress()
  }

  function removeAddress(index) {
    if (editingIndex === index) cancelEditAddress()
    setAddresses(addresses.filter((_, i) => i !== index))
  }

  async function save() {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await apiRequest('/v1/locations', {
        method: 'PUT',
        token,
        body: {
          sectionTitle,
          sectionDesc,
          callTitle,
          callDesc,
          phone,
          workingHours,
          addresses,
          heroTagline: heroTagline || null,
          logoUrl: logoUrl || null,
          mapImageUrl: mapImageUrl || null,
          companySubtitle: companySubtitle || null,
        },
      })
      setSuccess('تم الحفظ بنجاح')
    } catch (err) {
      setError(err?.message || 'فشل الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell
      title="الفروع واتصل بنا"
      subtitle="قسم الصفحة الرئيسية (فروعنا / اتصل بنا) وصفحة الفروع."
    >
      <div className="dash-card">
        {isLoading ? (
          <div className="dash-subtitle">جارٍ التحميل…</div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            <section style={{ display: 'grid', gap: 12 }}>
              <h3 style={{ margin: 0 }}>رأس القسم (الصفحة الرئيسية)</h3>
              <p className="dash-subtitle" style={{ margin: 0 }}>
                إن ملأت «السطر الموحّد» يُعرض سطر واحد تحت العنوانين بدل وصفي «فروعنا» و«اتصل بنا» المنفصلين.
              </p>
              <input
                className="form-input"
                placeholder="عنوان «فروعنا»"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
              />
              <textarea
                className="form-input"
                placeholder="وصف تحت «فروعنا» (يُخفى إن وُجد السطر الموحّد)"
                value={sectionDesc}
                onChange={(e) => setSectionDesc(e.target.value)}
                rows={2}
                style={{ resize: 'vertical' }}
              />
              <input
                className="form-input"
                placeholder="عنوان «اتصل بنا»"
                value={callTitle}
                onChange={(e) => setCallTitle(e.target.value)}
              />
              <textarea
                className="form-input"
                placeholder="وصف تحت «اتصل بنا» (يُخفى إن وُجد السطر الموحّد)"
                value={callDesc}
                onChange={(e) => setCallDesc(e.target.value)}
                rows={2}
                style={{ resize: 'vertical' }}
              />
              <textarea
                className="form-input"
                placeholder="السطر الموحّد (اختياري) — مثال: ابدأ رحلتك مع صناع الفرص... اعرف أقرب فرع إليك لا تتردد في التواصل الآن"
                value={heroTagline}
                onChange={(e) => setHeroTagline(e.target.value)}
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </section>

            <section style={{ display: 'grid', gap: 12 }}>
              <h3 style={{ margin: 0 }}>الهاتف والصور</h3>
              <input
                className="form-input"
                placeholder="رقم الهاتف"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">شعار الشركة (يظهر بجانب أوقات العمل)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                  <input
                    className="form-input"
                    style={{ flex: 1, minWidth: 200 }}
                    placeholder="رابط الصورة"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                  <label className="file-upload-btn" style={{ cursor: uploading === 'logo' ? 'wait' : 'pointer' }}>
                    <FiImage style={{ marginInlineEnd: 6 }} />
                    {uploading === 'logo' ? '…' : 'رفع'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading === 'logo'}
                      onChange={(e) => handleUpload('logo', e.target.files?.[0])}
                    />
                  </label>
                </div>
                {logoUrl ? (
                  <img src={logoUrl} alt="" style={{ maxWidth: 160, marginTop: 8, borderRadius: 8 }} />
                ) : null}
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">صورة الخريطة الكبيرة</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                  <input
                    className="form-input"
                    style={{ flex: 1, minWidth: 200 }}
                    placeholder="رابط الصورة"
                    value={mapImageUrl}
                    onChange={(e) => setMapImageUrl(e.target.value)}
                  />
                  <label className="file-upload-btn" style={{ cursor: uploading === 'map' ? 'wait' : 'pointer' }}>
                    <FiImage style={{ marginInlineEnd: 6 }} />
                    {uploading === 'map' ? '…' : 'رفع'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading === 'map'}
                      onChange={(e) => handleUpload('map', e.target.files?.[0])}
                    />
                  </label>
                </div>
                {mapImageUrl ? (
                  <img src={mapImageUrl} alt="" style={{ maxWidth: 280, marginTop: 8, borderRadius: 8 }} />
                ) : null}
              </div>
              <textarea
                className="form-input"
                placeholder="سطر تحت الشعار (اسم الشركة بالعربي/الإنجليزي)"
                value={companySubtitle}
                onChange={(e) => setCompanySubtitle(e.target.value)}
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </section>

            <section style={{ display: 'grid', gap: 12 }}>
              <h3 style={{ margin: 0 }}>أوقات العمل</h3>
              <textarea
                className="form-input"
                placeholder="سطر لكل فترة"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </section>

            <section style={{ display: 'grid', gap: 12 }}>
              <h3 style={{ margin: 0 }}>العناوين</h3>
              <div className="locations-address-list" style={{ display: 'grid', gap: 10 }}>
                {addresses.map((addr, i) => (
                  <div
                    key={`addr-${i}-${addr.city}`}
                    className="locations-address-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      padding: 14,
                      background: 'var(--panel-2)',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      minWidth: 0,
                    }}
                  >
                    {editingIndex === i ? (
                      <>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                          <FiMapPin size={18} style={{ flexShrink: 0, color: 'var(--muted)' }} />
                          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--muted)' }}>
                            تعديل العنوان
                          </span>
                        </div>
                        <input
                          className="form-input"
                          placeholder="المدينة"
                          value={editDraft.city}
                          onChange={(e) => setEditDraft({ ...editDraft, city: e.target.value })}
                        />
                        <textarea
                          className="form-input"
                          placeholder="العنوان الكامل"
                          value={editDraft.fullAddress}
                          onChange={(e) => setEditDraft({ ...editDraft, fullAddress: e.target.value })}
                          rows={3}
                          style={{ resize: 'vertical' }}
                        />
                        <input
                          className="form-input"
                          placeholder="رابط تضمين كامل أو رابط المكان من المتصفح"
                          value={editDraft.mapEmbedUrl}
                          onChange={(e) => setEditDraft({ ...editDraft, mapEmbedUrl: e.target.value })}
                        />
                        <p className="form-hint" style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                          الأفضل: مشاركة ← تضمين خريطة ← انسخ src. أو الصق رابط يحتوي @خط العرض،خط الطول. إن وُجد
                          lat/lng أدناه تُستخدم للخريطة وتتجاوز رابط pb التالف.
                        </p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <input
                            className="form-input"
                            style={{ width: 140 }}
                            placeholder="lat"
                            value={editDraft.lat}
                            onChange={(e) => setEditDraft({ ...editDraft, lat: e.target.value })}
                          />
                          <input
                            className="form-input"
                            style={{ width: 140 }}
                            placeholder="lng"
                            value={editDraft.lng}
                            onChange={(e) => setEditDraft({ ...editDraft, lng: e.target.value })}
                          />
                        </div>
                        <div className="locations-address-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="dash-btn dash-btn-primary dash-btn-sm"
                            onClick={saveEditAddress}
                            title="حفظ التعديل"
                          >
                            <FiCheck size={16} style={{ marginInlineEnd: 6 }} />
                            حفظ
                          </button>
                          <button
                            type="button"
                            className="dash-btn dash-btn-secondary dash-btn-sm"
                            onClick={cancelEditAddress}
                            title="إلغاء"
                          >
                            <FiX size={16} style={{ marginInlineEnd: 6 }} />
                            إلغاء
                          </button>
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                        }}
                      >
                        <FiMapPin size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700 }}>{addr.city}</div>
                          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                            {addr.fullAddress}
                          </div>
                          {addr.mapEmbedUrl ? (
                            <div
                              style={{
                                fontSize: 12,
                                color: 'var(--muted)',
                                marginTop: 6,
                                wordBreak: 'break-all',
                              }}
                            >
                              خريطة: {String(addr.mapEmbedUrl).slice(0, 80)}
                              {String(addr.mapEmbedUrl).length > 80 ? '…' : ''}
                            </div>
                          ) : null}
                        </div>
                        <div
                          className="dash-actions-cell"
                          style={{ marginInlineStart: 'auto', flexShrink: 0 }}
                        >
                          <button
                            type="button"
                            className="dash-action-btn dash-action-edit"
                            onClick={() => startEditAddress(i)}
                            title="تعديل"
                            aria-label="تعديل العنوان"
                            disabled={editingIndex !== null && editingIndex !== i}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            type="button"
                            className="dash-action-btn dash-action-delete"
                            onClick={() => removeAddress(i)}
                            title="حذف"
                            aria-label="حذف العنوان"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  padding: 16,
                  border: '1px dashed var(--border)',
                  borderRadius: 10,
                }}
              >
                <input
                  className="form-input"
                  placeholder="المدينة"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
                <textarea
                  className="form-input"
                  placeholder="العنوان الكامل"
                  value={newAddress.fullAddress}
                  onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
                <input
                  className="form-input"
                  placeholder="src كامل من Google: https://www.google.com/maps/embed?pb=…"
                  value={newAddress.mapEmbedUrl}
                  onChange={(e) => setNewAddress({ ...newAddress, mapEmbedUrl: e.target.value })}
                />
                <p className="form-hint" style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                  رابط التضمين من Google (مشاركة ← تضمين خريطة) هو الأفضل. روابط المشاركة القصيرة مثل
                  maps.app.goo.gl تُحوَّل تلقائياً على الخادم إلى رابط تضمين. لصق كامل وسم iframe يعمل أيضاً.
                  إن فشل التضمين، أدخل خط العرض/الطول أدناه.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    className="form-input"
                    style={{ width: 140 }}
                    placeholder="خط العرض lat"
                    value={newAddress.lat}
                    onChange={(e) => setNewAddress({ ...newAddress, lat: e.target.value })}
                  />
                  <input
                    className="form-input"
                    style={{ width: 140 }}
                    placeholder="خط الطول lng"
                    value={newAddress.lng}
                    onChange={(e) => setNewAddress({ ...newAddress, lng: e.target.value })}
                  />
                </div>
                <button type="button" className="dash-btn dash-btn-secondary" onClick={addAddress}>
                  + إضافة عنوان
                </button>
              </div>
            </section>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="button" className="dash-btn dash-btn-primary" onClick={save} disabled={isSaving}>
                <FiSave size={16} />
                {isSaving ? 'جارٍ الحفظ…' : 'حفظ'}
              </button>
            </div>
            {error ? <div style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}
            {success ? <div style={{ color: '#16a34a', fontWeight: 700 }}>{success}</div> : null}
          </div>
        )}
      </div>
    </PageShell>
  )
}

export default LocationsPage
