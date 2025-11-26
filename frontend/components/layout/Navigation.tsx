// frontend/components/layout/Navigation.tsx
"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";

const Navigation = () => {
  const t = useTranslations("navigation");

  return (
    <nav className="flex space-x-8">
      <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
        {t("home")}
      </Link>
      <Link href="/profile" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
        {t("profile")}
      </Link>
      <Link href="/orders" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
        {t("orders")}
      </Link>
      <Link href="/settings" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
        {t("settings")}
      </Link>
    </nav>
  );
};

export default Navigation;
