import { getRequestConfig } from 'next-intl/server';
import en from './locales/en.json';
import ar from './locales/ar.json';

export default getRequestConfig(async ({ locale }) => ({
  messages: locale === 'ar' ? ar : en,
}));
