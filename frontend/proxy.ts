import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

export default function proxy(request: NextRequest) {
  const handle = createMiddleware({
    locales: ['en', 'ar'],
    defaultLocale: 'ar',
  });

  return handle(request);
}

/*

import { NextRequest } from 'next/server';
import { createI18nMiddleware } from 'next-intl/middleware';

const i18nMiddleware = createI18nMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'ar',
});

export function proxy(request: NextRequest) {
  return i18nMiddleware(request);
}

*/

/*
import { NextRequest } from 'next/server';
import { createI18nMiddleware } from 'next-intl/middleware';

const i18nMiddleware = createI18nMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'ar'
});

export function middleware(request: NextRequest) {
  return i18nMiddleware(request);
}

*/
/*
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'ar',
});

export const config = {
  matcher: ['/', '/(ar|en)/:path*'],
};
*/
