// frontend/app/[locale]/page.tsx
"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "../../components/ui/Button";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t("welcome")}</h1>
        <div className="space-x-4">
          <Link href="/register">
            <Button>{t("register")}</Button>
          </Link>
          <Link href="/login">
            <Button>{t("login")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/*

// frontend/app/[locale]/page.tsx
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "../../components/ui/Button";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t("welcome")}</h1>
        <div className="space-x-4">
          <Link href="/register">
            <Button>{t("register")}</Button>
          </Link>
          <Link href="/login
*/
