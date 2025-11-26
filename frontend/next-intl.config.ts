// frontend/next-intl.config.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // حدد اللغة الافتراضية إذا لم تُمرر
  const currentLocale = locale || 'ar';

  try {
    const messages = (await import(`./i18n/locales/${currentLocale}.json`)).default;
    return { locale: currentLocale, messages };
  } catch (error) {
    // في حال عدم العثور على ملف اللغة، استخدم العربية افتراضيًا
    const fallback = (await import('./i18n/locales/ar.json')).default;
    return { locale: 'ar', messages: fallback };
  }
});



/*
import { getRequestConfig } from 'next-intl/server';
import ar from './i18n/locales/ar.json';
import en from './i18n/locales/en.json';

export default getRequestConfig(async ({ locale }) => ({
  messages: locale === 'ar' ? ar : en,
}));
*/
