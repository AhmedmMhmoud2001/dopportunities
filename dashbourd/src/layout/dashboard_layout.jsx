import { useCallback, useEffect, useState } from 'react'
import { Header } from '../components/header'
import { Sidebar } from '../components/sidebar'
import { useLocale } from '../hooks/use_locale'

const MOBILE_MAX = 900

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_MAX : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`)
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

export function DashboardLayout({ children }) {
  const { locale } = useLocale()
  const isMobile = useIsMobile()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const onToggleMenu = useCallback(() => {
    if (isMobile) setMobileDrawerOpen((v) => !v)
    else setSidebarCollapsed((v) => !v)
  }, [isMobile])

  const onCloseSidebar = useCallback(() => {
    setMobileDrawerOpen(false)
  }, [])

  const shellClass = [
    'dash-shell',
    !isMobile && sidebarCollapsed ? 'dash-shell--sidebar-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const isArabic = locale === 'ar'

  return (
    <div className={shellClass} dir={isArabic ? 'rtl' : 'ltr'} lang={isArabic ? 'ar' : 'en'}>
      <Sidebar
        isMobile={isMobile}
        mobileOpen={mobileDrawerOpen}
        onClose={onCloseSidebar}
        collapsed={!isMobile && sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      <div className="dash-main">
        <Header
          onToggleMenu={onToggleMenu}
          isMobile={isMobile}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="dash-content">{children}</main>
      </div>
    </div>
  )
}