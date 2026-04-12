import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { IconArrowRight } from '../components/icons'

export function TermsPage() {
  const [terms, setTerms] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTerms()
  }, [])

  async function loadTerms() {
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/terms')
      setTerms(data)
    } catch (err) {
      setError(err?.message || 'لا يمكن تحميل الشروط والأحكام')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="public-page">
        <div className="public-container">
          <div className="loading-state">جارٍ التحميل...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="public-page">
        <div className="public-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="public-page">
      <div className="public-container">
        <div className="terms-content">
          <div className="terms-header">
            <h1 className="terms-title">{terms?.title || 'الشروط والأحكام'}</h1>
            {terms?.version && (
              <span className="terms-version">الإصدار {terms.version}</span>
            )}
          </div>
          
          <div className="terms-body terms-body--plain">
            {terms?.content?.trim() ? terms.content : 'لا يوجد محتوى متاح.'}
          </div>

          <div className="terms-footer">
            <p className="terms-updated">
              آخر تحديث: {terms?.updatedAt ? new Date(terms.updatedAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}