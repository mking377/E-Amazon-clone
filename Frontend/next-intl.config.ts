// frontend/next-intl.config.ts
import type { NextIntlConfig } from 'next-intl';

const nextIntlConfig: NextIntlConfig = {
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  messagesDirectory: './messages'
};

export default nextIntlConfig;



