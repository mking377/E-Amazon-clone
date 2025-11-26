// frontend/components/common/LanguageSwitcher.tsx
"use client";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex space-x-1">
      <button
        onClick={() => switchLanguage("en")}
        className={`px-3 py-1 rounded-full transition-all duration-300 ${
          locale === "en" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage("ar")}
        className={`px-3 py-1 rounded-full transition-all duration-300 ${
          locale === "ar" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        }`}
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
