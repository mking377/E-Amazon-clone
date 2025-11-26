"use client";

import { ReactNode, useContext } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { UserContext } from "../../context/userContext";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useContext(UserContext);
  const t = useTranslations("admin"); // ملف الترجمات admin.json

  const allowedRoles = ["admin", "superadmin", "manager", "moderator", "support"];
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">{t("accessDenied")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="block hover:underline">{t("dashboard")}</Link>
          {(user.role === "superadmin" || user.role === "admin") && (
            <Link href="/admin/users" className="block hover:underline">{t("users")}</Link>
          )}
          {user.role === "superadmin" && (
            <Link href="/admin/settings" className="block hover:underline">{t("settings")}</Link>
          )}
          {user.role !== "user" && (
            <Link href="/admin/orders" className="block hover:underline">{t("orders")}</Link>
          )}
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
};

export default AdminLayout;
