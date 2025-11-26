// frontend/app/[locale]/(auth)/forgot-password/page.tsx
"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import api from "../../../../lib/axios";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Loading } from "../../../../components/ui/Loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/Card";

const ForgotPasswordPage = () => {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("Reset link sent to your email");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{t("forgotPassword")}</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("email")}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {message && (
              <div className="text-green-600 text-sm text-center">{message}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loading /> : t("sendResetLink")}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              {t("backToLogin")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
