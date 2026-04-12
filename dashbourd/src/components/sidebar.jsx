import { NavLink } from 'react-router-dom'

const navItems = [
  {
    title: 'الرئيسية',
    items: [
      { to: '/', label: 'نظرة عامة', icon: 'home' },
      { to: '/home-intro', label: 'إحصائيات وكيف نعمل', icon: 'chart' },
      { to: '/home-work-consultant', label: 'طريقة العمل والمستشار', icon: 'workflow' },
    ],
  },
  { title: 'الإدارة', items: [
    { to: '/users', label: 'المستخدمون', icon: 'users' },
    { to: '/blogs', label: 'المدونات', icon: 'blog' },
    { to: '/services', label: 'الخدمات', icon: 'services' },
    { to: '/home-features', label: 'قسم الميزات', icon: 'features' },
    { to: '/testimonials', label: 'آراء العملاء', icon: 'testimonial' },
    { to: '/faqs', label: 'الأسئلة الشائعة', icon: 'faq' },
    { to: '/contacts', label: 'جهات الاتصال', icon: 'contact' },
    { to: '/about', label: 'حول', icon: 'about' },
    { to: '/locations', label: 'الفروع', icon: 'location' },
  ] },
  { title: 'الإعدادات', items: [
    { to: '/settings/terms', label: 'الشروط والأحكام', icon: 'about' },
    { to: '/settings/footer-social', label: 'روابط السوشيال (الفوتر)', icon: 'social' },
  ] },
]

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconPages() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

function IconBlog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9-9z" />
    </svg>
  )
}

function IconServices() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconTestimonial() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconFaq() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
    </svg>
  )
}

function IconContact() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  )
}

function IconAbout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}

function IconLocation() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconFeatures() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  )
}

function IconWorkflow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="5" cy="6" r="2" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="5" cy="18" r="2" />
      <path d="M8 6h13M8 12h13M8 18h13" />
    </svg>
  )
}

function IconSocial() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  )
}

const icons = {
  home: IconHome,
  chart: IconChart,
  workflow: IconWorkflow,
  users: IconUsers,
  pages: IconPages,
  blog: IconBlog,
  services: IconServices,
  testimonial: IconTestimonial,
  faq: IconFaq,
  contact: IconContact,
  about: IconAbout,
  location: IconLocation,
  features: IconFeatures,
  social: IconSocial,
}

function IconPanelLeft({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  )
}

export function Sidebar({ isMobile, mobileOpen, onClose, collapsed, onToggleCollapse }) {
  const asideClass = [
    'dash-sidebar',
    isMobile ? (mobileOpen ? 'is-open' : '') : 'dash-sidebar--desktop',
    collapsed ? 'dash-sidebar--collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {isMobile ? (
        <div
          className={`dash-overlay ${mobileOpen ? 'is-open' : ''}`}
          onClick={onClose}
          aria-hidden={!mobileOpen}
        />
      ) : null}
      <aside className={asideClass}>
        <div className="dash-sidebar__header">
          <div className="sidebar-brand">
            <div className="dash-logo">A</div>
            <span className="sidebar-brand__name">لوحة التحكم</span>
          </div>
          {!isMobile ? (
            <button
              type="button"
              className="dash-sidebar-collapse-btn dash-sidebar-collapse-btn--header"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
            >
              <IconPanelLeft />
            </button>
          ) : (
            <button type="button" className="sidebar-close-btn" onClick={onClose} aria-label="إغلاق">
              <IconClose />
            </button>
          )}
        </div>

        <nav className="dash-sidebar__nav">
          {navItems.map((section) => (
            <div key={section.title} className="dash-nav__section">
              <div className="dash-nav__title">{section.title}</div>
              {section.items.map((item) => {
                const IconComponent = icons[item.icon]
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    title={item.label}
                    className={({ isActive }) => `dash-nav__item ${isActive ? 'is-active' : ''}`}
                    onClick={() => isMobile && onClose()}
                  >
                    <span className="dash-nav__item-icon">
                      <IconComponent />
                    </span>
                    <span className="dash-nav__item-label">{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}