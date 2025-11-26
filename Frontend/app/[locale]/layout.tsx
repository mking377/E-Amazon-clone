export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}



/*
// app/[locale]/layout.tsx
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import nextIntlConfig from "@/next-intl.config";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DarkModeToggle from "@/components/DarkModeToggle";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale?: string };
}) {
  const locale = (await params).locale ?? nextIntlConfig.defaultLocale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div lang={locale} dir={dir} className="min-h-screen">
        <nav className="w-full bg-gray-100 p-4 flex justify-between items-center">
          {/* Language switcher *}
          <div className={locale === "ar" ? "order-1" : "order-2"}>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </nav>

        {children}
      </div>
    </NextIntlClientProvider>
  );
}

*/


/*

import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import nextIntlConfig from "@/next-intl.config";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DarkModeToggle from "@/components/DarkModeToggle";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale?: string };
}) {
  const locale = (await params).locale ?? nextIntlConfig.defaultLocale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div lang={locale} dir={dir}>
        <nav className="w-full bg-gray-100 p-4 flex justify-between items-center">
          <div className={locale === "ar" ? "order-2" : "order-1"}>
            <DarkModeToggle />
          </div>
          <div className={locale === "ar" ? "order-1" : "order-2"}>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </nav>

        {children}
      </div>
    </NextIntlClientProvider>
  );
}

*/

/*

import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import nextIntlConfig from "@/next-intl.config";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale?: string };
}) {
  const locale = (await params).locale ?? nextIntlConfig.defaultLocale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <div lang={locale} dir={dir}>
      <nav className="w-full bg-gray-100 p-4 flex justify-end">
        <LanguageSwitcher currentLocale={locale} />
      </nav>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}

*/

