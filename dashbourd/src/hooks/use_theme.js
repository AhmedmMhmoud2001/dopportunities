import { useEffect } from 'react'
import { useLocalStorage } from './use_local_storage'

const STORAGE_KEY = 'tem-dashboard:theme' // 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEY, 'light')

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
  }, [theme])

  return { theme, setTheme }
}

