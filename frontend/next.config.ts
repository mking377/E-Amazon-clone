// frontend/next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

// ربط الإعداد مع ملف next-intl.config.ts
const withNextIntl = createNextIntlPlugin('./next-intl.config.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);

/*

// frontend/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
*/

/*

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
      },
    ],
  },
  experimental: {
    turbo: false,
  },
};

export default nextConfig;

*/

/*
// frontend/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['cloudinary.com'], // للصور
  },
};

export default nextConfig;

*/
