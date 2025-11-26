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

/*

"use client";
import { useRouter, usePathname } from "next/navigation";

interface LanguageSwitcherProps {
  currentLocale: string;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = currentLocale === "ar" ? "en" : "ar";
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length > 0 && ["ar", "en"].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }

    router.push("/" + segments.join("/"));
  };

  const otherLocaleLabel = currentLocale === "ar" ? "English" : "العربية";

  return (
    <button
      onClick={toggleLanguage}
      className="
        px-3 py-2 rounded-lg
        bg-gray-200 dark:bg-gray-700
        text-gray-900 dark:text-gray-100
        shadow hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors duration-300
      "
    >
      {otherLocaleLabel}
    </button>
  );
}

*/

/*
"use client";

import { useRouter, usePathname } from "next/navigation";

interface LanguageSwitcherProps {
  currentLocale: string;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname(); // المسار الحالي (/en/register مثلًا)

  const handleChange = (newLocale: string) => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length > 0 && ["ar", "en"].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }

    const newPath = "/" + segments.join("/");
    router.push(newPath);
  };

  return (
    <select
      value={currentLocale}
      onChange={(e) => handleChange(e.target.value)}
      className="
        border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-700
        text-gray-900 dark:text-gray-100
        px-3 py-1 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors duration-300
      "
    >
      <option value="ar">العربية</option>
      <option value="en">English</option>
    </select>
  );
}

*/

/*

// frontend/components/LanguageSwitcher.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

interface LanguageSwitcherProps {
  currentLocale: string;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname(); // المسار الحالي (/en/register مثلًا)

  const handleChange = (newLocale: string) => {
    // قسم المسار لأجزاء
    const segments = pathname.split("/").filter(Boolean);

    // لو أول جزء Locale (ar أو en) غيره
    if (segments.length > 0 && ["ar", "en"].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      // لو مفيش Locale ضيفه
      segments.unshift(newLocale);
    }

    const newPath = "/" + segments.join("/");
    router.push(newPath);
  };

  return (
    <select
      value={currentLocale}
      onChange={(e) => handleChange(e.target.value)}
      className="border rounded px-2 py-1"
    >
      <option value="ar">العربية</option>
      <option value="en">English</option>
    </select>
  );
}

*/
