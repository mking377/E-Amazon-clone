// frontend/components/layout/Sidebar.tsx
"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";

const Sidebar = () => {
  const t = useTranslations("navigation");

  return (
    <aside className="bg-gray-100 dark:bg-gray-800 w-64 h-full p-4">
      <nav className="space-y-4">
        <Link href="/" className="block text-gray-700 dark:text-gray-300 hover:text-primary">
          {t("home")}
        </Link>
        <Link href="/profile" className="block text-gray-700 dark:text-gray-300 hover:text-primary">
          {t("profile")}
        </Link>
        <Link href="/orders" className="block text-gray-700 dark:text-gray-300 hover:text-primary">
          {t("orders")}
        </Link>
        <Link href="/settings" className="block text-gray-700 dark:text-gray-300 hover:text-primary">
          {t("settings")}
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
