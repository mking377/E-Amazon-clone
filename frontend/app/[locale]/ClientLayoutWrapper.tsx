// frontend/app/[locale]/ClientLayoutWrapper.tsx
"use client";
import { AuthProvider } from "../../components/providers/AuthProvider";
import Header from "../../components/layout/Header";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <main className="pt-16">{children}</main>
    </AuthProvider>
  );
}

/*
'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Header from '@/components/layout/Header';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Header />
        <main className="pt-16">{children}</main>
      </ThemeProvider>
    </AuthProvider>
  );
}


*/

/*

'use client'; // يسمح باستخدام useAuth و AuthProvider
import { AuthProvider } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <main className="pt-16">{children}</main>
    </AuthProvider>
  );
}

*/
