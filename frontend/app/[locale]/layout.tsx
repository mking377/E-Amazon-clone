// frontend/app/[locale]/layout.tsx
import ClientLayoutWrapper from './ClientLayoutWrapper';

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}

/*
// Server Component - إعداد اللغة والرسائل
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import '../globals.css';

export const metadata = {
  title: 'Amazon Clone',
  description: 'E-commerce platform',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // ← ضروري await هنا
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}




*/



/*
// frontend/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import '../globals.css';

export const metadata = {
  title: 'Amazon Clone',
  description: 'E-commerce platform',
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <Header />
            <main className="pt-16">{children}</main>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
*/

/*
// frontend/app/[locale]/layout.tsx
export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
*/
