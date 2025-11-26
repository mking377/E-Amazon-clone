// frontend/components/layout/Header.tsx
"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import LanguageSwitcher from "../common/LanguageSwitcher";
import ThemeToggle from "../common/ThemeToggle";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.startsWith('/ar') ? 'ar' : 'en';
  const t = (key: string) => {
    const translations = locale === 'ar' ? require('../../i18n/locales/ar.json') : require('../../i18n/locales/en.json');
    return translations.navigation?.[key] || key;
  };
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="text-xl font-bold text-primary">
              Amazon Clone
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href={`/${locale}`} className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              {t("home")}
            </Link>
            {user && (
              <>
                <Link href={`/${locale}/profile`} className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                  {t("profile")}
                </Link>
                <Link href={`/${locale}/orders`} className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                  {t("orders")}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            {user ? (
              <Button onClick={logout} variant="outline" size="sm">
                {t("logout")}
              </Button>
            ) : (
              <div className="space-x-2">
                <Link href={`/${locale}/login`}>
                  <Button variant="outline" size="sm">
                    {t("login")}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button size="sm">
                    {t("register")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


/*

'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeToggle from '../common/ThemeToggle';

const Header = () => {
  const t = useTranslations('navigation');
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Amazon Clone
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
              {t('home')}
            </Link>
            {user && (
              <>
                <Link href="/profile" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                  {t('profile')}
                </Link>
                <Link href="/orders" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                  {t('orders')}
                </Link>
              </>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            {user ? (
              <Button onClick={logout} variant="outline" size="sm">
                {t('logout')}
              </Button>
            ) : (
              <div className="space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
*/
