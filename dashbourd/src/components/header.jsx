import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconMenu,
  IconBell,
  IconSun,
  IconMoon,
  IconUser,
  IconChevronDown,
} from './icons'
import { useTheme } from '../hooks/use_theme'
import { useLocale } from '../hooks/use_locale'
import { useAuth } from '../auth/auth_context'
import { apiRequest } from '../lib/api'

export function Header({ onToggleMenu, isMobile, sidebarCollapsed }) {
  const { theme, setTheme } = useTheme()
  const { locale } = useLocale()
  const { token } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const notifyRef = useRef(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotify, setRecentNotify] = useState([])

  const onToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const loadNotifications = useCallback(async () => {
    if (!token) return
    try {
      const data = await apiRequest('/v1/contacts/notifications/summary', { token })
      setUnreadCount(Number(data?.unreadCount) || 0)
      setRecentNotify(Array.isArray(data?.recent) ? data.recent : [])
    } catch {
      /* ignore */
    }
  }, [token])

  useEffect(() => {
    if (!token) return undefined
    loadNotifications()
    const t = window.setInterval(loadNotifications, 25000)
    return () => window.clearInterval(t)
  }, [token, loadNotifications])

  useEffect(() => {
    if (!notifyOpen) return
    loadNotifications()
  }, [notifyOpen, loadNotifications])

  useEffect(() => {
    if (!profileOpen && !notifyOpen) return
    const onDoc = (e) => {
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (notifyOpen && notifyRef.current && !notifyRef.current.contains(e.target)) {
        setNotifyOpen(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [profileOpen, notifyOpen])

  const menuLabel =
    isMobile ? 'فتح القائمة' : sidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'

  return (
    <header className="dash-header">
      <div className="dash-header__left">
        <button
          type="button"
          className="dash-header-btn"
          onClick={onToggleMenu}
          aria-label={menuLabel}
        >
          <IconMenu />
        </button>

        <div className="dash-header__brand">
          <div className="dash-logo dash-logo--header">A</div>
          <span className="dash-logo-text">لوحة التحكم</span>
        </div>
      </div>

      <div className="dash-header__right">
        <button
          type="button"
          className="dash-header-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
        >
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>

        <div className="dash-header-notify-wrap" ref={notifyRef}>
          <button
            type="button"
            className="dash-header-btn dash-header-btn--notify"
            aria-label={locale === 'ar' ? 'إشعارات طلبات التواصل' : 'Contact request notifications'}
            aria-expanded={notifyOpen}
            onClick={() => setNotifyOpen((v) => !v)}
          >
            <IconBell />
            {unreadCount > 0 ? (
              <span className="dash-header-badge dash-header-badge--count" aria-hidden="true">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>
          {notifyOpen ? (
            <div className="dash-header-notify-panel" role="dialog" aria-label="Notifications">
              <div className="dash-header-notify-panel__title">
                {locale === 'ar' ? 'طلبات جديدة' : 'New requests'}
              </div>
              {!recentNotify.length ? (
                <div className="dash-header-notify-panel__empty">
                  {locale === 'ar' ? 'لا توجد طلبات غير مقروءة' : 'No unread requests'}
                </div>
              ) : (
                <ul className="dash-header-notify-panel__list">
                  {recentNotify.map((n) => (
                    <li key={n.id}>
                      <Link
                        to="/contacts"
                        className="dash-header-notify-item"
                        onClick={() => setNotifyOpen(false)}
                      >
                        <span className="dash-header-notify-item__code">{n.trackingCode}</span>
                        <span className="dash-header-notify-item__name">
                          {n.firstName} {n.secondName}
                        </span>
                        <span className="dash-header-notify-item__meta">{n.activity}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/contacts" className="dash-header-notify-panel__footer" onClick={() => setNotifyOpen(false)}>
                {locale === 'ar' ? 'فتح صفحة جهات الاتصال' : 'Open contacts'}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="dash-header-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="dash-header-profile"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((v) => !v)}
          >
            <span className="dash-header-profile__avatar" aria-hidden="true">
              <IconUser size={18} />
            </span>
            <span className="dash-header-profile__meta">
              <span className="dash-header-profile__name">المسؤول</span>
              <span className="dash-header-profile__role">مدير النظام</span>
            </span>
            <IconChevronDown size={16} />
          </button>
          {profileOpen ? (
            <div className="dash-header-profile__menu" role="menu">
              <button type="button" className="dash-header-profile__item" role="menuitem">
                الإعدادات
              </button>
              <button type="button" className="dash-header-profile__item" role="menuitem">
                المساعدة
              </button>
              <hr className="dash-header-profile__sep" />
              <button type="button" className="dash-header-profile__item dash-header-profile__item--danger" role="menuitem">
                تسجيل الخروج
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
