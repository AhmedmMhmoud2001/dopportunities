import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'

export function AboutPage() {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Top card (about)
  const [about, setAbout] = useState({ id: null, slug: 'about', title: 'About', content: '' })
  // Company card
  const [company, setCompany] = useState({
    id: null,
    slug: 'about_company',
    title: 'شركة صناع الفرص',
    content: '',
  })
  // Mission
  const [mission, setMission] = useState({ id: null, slug: 'about_mission', title: 'مهمتنا', content: '' })
  // Vision
  const [vision, setVision] = useState({ id: null, slug: 'about_vision', title: 'رؤيتنا', content: '' })
  // Consultant
  const [consultant, setConsultant] = useState({
    id: null,
    slug: 'about_consultant',
    title: 'المستشار أنور علي',
    content: '',
  })

  const [isSaving, setIsSaving] = useState(false)

  async function load() {
    setError(null)
    setIsLoading(true)
    try {
      // Load all slugs in parallel
      const slugs = ['about', 'about_company', 'about_mission', 'about_vision', 'about_consultant']
      const results = await Promise.all(
        slugs.map(async (slug) => {
          try {
            const data = await apiRequest(`/v1/pages/${slug}`)
            return data
          } catch {
            return null
          }
        }),
      )

      const [aboutData, companyData, missionData, visionData, consultantData] = results
      if (aboutData) setAbout({ id: aboutData.id, slug: aboutData.slug, title: aboutData.title || 'About', content: aboutData.content || '' })
      if (companyData)
        setCompany({
          id: companyData.id,
          slug: companyData.slug,
          title: companyData.title || 'شركة صناع الفرص',
          content: companyData.content || '',
        })
      if (missionData)
        setMission({ id: missionData.id, slug: missionData.slug, title: missionData.title || 'مهمتنا', content: missionData.content || '' })
      if (visionData)
        setVision({ id: visionData.id, slug: visionData.slug, title: visionData.title || 'رؤيتنا', content: visionData.content || '' })
      if (consultantData)
        setConsultant({
          id: consultantData.id,
          slug: consultantData.slug,
          title: consultantData.title || 'المستشار أنور علي',
          content: consultantData.content || '',
        })
    } catch (err) {
      // If not found, we will allow creating it
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function upsertPage({ id, slug, title, content }) {
    // Update by id when exists; otherwise create by slug
    if (id) {
      await apiRequest(`/v1/pages/${id}`, {
        method: 'PUT',
        token,
        body: { slug, title, content },
      })
      return
    }
    await apiRequest('/v1/pages', {
      method: 'POST',
      token,
      body: { slug, title, content },
    })
  }

  async function saveAll() {
    setIsSaving(true)
    setError(null)
    try {
      await upsertPage(about)
      await upsertPage(company)
      await upsertPage(mission)
      await upsertPage(vision)
      await upsertPage(consultant)
    } finally {
      setIsSaving(false)
      await load()
    }
  }

  return (
    <PageShell
      title="صفحة من نحن"
      subtitle="إدارة محتوى صفحة من نحن العامة."
    >
      <div className="dash-card">
        {isLoading ? (
          <div style={{ color: '#475569' }}>جارٍ التحميل…</div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            <section style={{ display: 'grid', gap: 10 }}>
              <h3 style={{ margin: 0 }}>البطاقة العلوية</h3>
              <input
                placeholder="العنوان"
                value={about.title}
                onChange={(e) => setAbout({ ...about, title: e.target.value })}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
              <textarea
                placeholder="المحتوى"
                value={about.content}
                onChange={(e) => setAbout({ ...about, content: e.target.value })}
                rows={6}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
            </section>

            <section style={{ display: 'grid', gap: 10 }}>
              <h3 style={{ margin: 0 }}>بطاقة الشركة</h3>
              <input
                placeholder="العنوان"
                value={company.title}
                onChange={(e) => setCompany({ ...company, title: e.target.value })}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
              <textarea
                placeholder="المحتوى"
                value={company.content}
                onChange={(e) => setCompany({ ...company, content: e.target.value })}
                rows={8}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
            </section>

            <section style={{ display: 'grid', gap: 10 }}>
              <h3 style={{ margin: 0 }}>المهمة</h3>
              <input
                placeholder="العنوان"
                value={mission.title}
                onChange={(e) => setMission({ ...mission, title: e.target.value })}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
              <textarea
                placeholder="المحتوى"
                value={mission.content}
                onChange={(e) => setMission({ ...mission, content: e.target.value })}
                rows={4}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
            </section>

            <section style={{ display: 'grid', gap: 10 }}>
              <h3 style={{ margin: 0 }}>الرؤية</h3>
              <input
                placeholder="العنوان"
                value={vision.title}
                onChange={(e) => setVision({ ...vision, title: e.target.value })}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
              <textarea
                placeholder="المحتوى"
                value={vision.content}
                onChange={(e) => setVision({ ...vision, content: e.target.value })}
                rows={4}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
            </section>

            <section style={{ display: 'grid', gap: 10 }}>
              <h3 style={{ margin: 0 }}>المستشار</h3>
              <input
                placeholder="العنوان"
                value={consultant.title}
                onChange={(e) => setConsultant({ ...consultant, title: e.target.value })}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
              <textarea
                placeholder="المحتوى"
                value={consultant.content}
                onChange={(e) => setConsultant({ ...consultant, content: e.target.value })}
                rows={10}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
            </section>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="dash-link" onClick={saveAll} disabled={isSaving}>
                {isSaving ? 'جارٍ الحفظ…' : 'حفظ الكل'}
              </button>
            </div>
            {error ? <div style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}
          </div>
        )}
      </div>
    </PageShell>
  )
}

export default AboutPage

