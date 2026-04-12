/** روابط الهيدر الموحّدة لكل الصفحات العامة */
export interface MainNavItem {
  label: string;
  href: string;
}

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  { label: 'الرئيسية', href: '/' },
  { label: 'خدماتنا', href: '/services' },
  { label: 'المقالات', href: '/blogs' },
  { label: 'الأسئلة المتكررة', href: '/faq' },
  { label: 'معلومات عنا', href: '/about' },
  { label: 'اتصل بنا', href: '/contact' },
  { label: 'الشروط و الأحكام', href: '/terms' },
  { label: 'فروعنا', href: '/locations' },
];
