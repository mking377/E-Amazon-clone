/*

// frontend/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import ar from '../messages/ar.json';
import en from '../messages/en.json';

export default getRequestConfig(async ({ locale }) => ({
  messages: locale === 'ar' ? ar : en,
}));

*/


/*
// frontend/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import ar from '../messages/ar.json';
import en from '../messages/en.json';

export default getRequestConfig(async ({ locale }) => ({
  messages: locale === 'ar' ? ar : en,
  locale,  // إضافة locale هنا
}));
*/

/*


// frontend/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import ar from '../messages/ar.json';
import en from '../messages/en.json';

export default getRequestConfig(async ({ locale }) => ({
  messages: locale === 'ar' ? ar : en,
  locale,
}));


*/

/*
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));

*/



// frontend/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import nextIntlConfig from '../next-intl.config';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale ?? nextIntlConfig.defaultLocale;
  return {
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
    locale: resolvedLocale
  };
});


