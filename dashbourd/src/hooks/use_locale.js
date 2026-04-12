import { useEffect } from 'react'
import { useLocalStorage } from './use_local_storage'

const STORAGE_KEY = 'tem-dashboard:locale' // 'en' | 'ar'

export function useLocale() {
  const [locale, setLocale] = useLocalStorage(STORAGE_KEY, 'ar')

  useEffect(() => {
    const root = document.documentElement
    const isArabic = locale === 'ar'
    root.setAttribute('lang', isArabic ? 'ar' : 'en')
    root.setAttribute('dir', isArabic ? 'rtl' : 'ltr')
  }, [locale])

  return { locale, setLocale }
}

