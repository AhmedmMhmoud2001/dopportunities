import { useState } from 'react';
import './Header.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../assets/images/logo.png';
import { useAuth } from '../auth/auth_context';

interface NavItem {
  label: string;
  href: string;
  /** للروابط الخارجية فقط؛ الروابط الداخلية تُحدَّد تلقائياً من المسار */
  active?: boolean;
}

/** يحدد أي رابط في الهيدر يكون نشطاً حسب URL الحالي (أدق من تمرير active يدوياً). */
function isNavLinkActive(pathname: string, href: string): boolean {
  if (!href.startsWith('/')) return false;
  if (href === '/') return pathname === '/';
  if (href === '/blogs') return pathname === '/blogs' || /^\/blog\//.test(pathname);
  if (href === '/contact') return pathname === '/contact' || pathname.startsWith('/contact/');
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface HeaderProps {
  navItems?: NavItem[];
  registerButtonText?: string;
  onRegisterClick?: () => void;
  logoutButtonText?: string;
}

function Header({ 
  navItems = [],
  registerButtonText = 'سجل الآن',
  onRegisterClick,
  logoutButtonText = 'تسجيل الخروج',
}: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthed, signOut } = useAuth();

  const handleRegisterButtonClick = () => {
    setIsMobileMenuOpen(false);
    onRegisterClick?.();
    navigate('/signup');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">

          {/* Logo - Right side in RTL */}
          <div className="header-logo">
            <img src={logoImage} alt="Logo" />
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Navigation Links - Center */}
          <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="nav-list">
              {navItems.map((item, index) => {
                const active = item.href.startsWith('/')
                  ? isNavLinkActive(location.pathname, item.href)
                  : Boolean(item.active);
                return (
                <li key={`${item.href}-${index}`}>
                  {item.href.startsWith('/') ? (
                    <Link 
                      to={item.href} 
                      className={`nav-link ${active ? 'active' : ''}`}
                      onClick={handleNavClick}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a 
                      href={item.href} 
                      className={`nav-link ${active ? 'active' : ''}`}
                      onClick={handleNavClick}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
                );
              })}
            </ul>
          </nav>

          <div className="header-actions">
            {isAuthed ? (
              <button
                className="register-button"
                onClick={() => {
                  signOut();
                }}
              >
                {logoutButtonText}
              </button>
            ) : (
              <button type="button" className="register-button" onClick={handleRegisterButtonClick}>
                {registerButtonText}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
