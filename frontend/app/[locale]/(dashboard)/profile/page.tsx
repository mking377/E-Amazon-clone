// frontend/app/[locale]/(dashboard)/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "../../../../lib/axios";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Loading } from "../../../../components/ui/Loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/Card";
import ProtectedRoute from "../../../../components/common/ProtectedRoute";

const ProfilePage = () => {
  const t = useTranslations("profile");
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setUser(response.data.user);
        setName(response.data.user.name);
        setEmail(response.data.user.email);
      } catch (err: any) {
        setMessage(err.response?.data?.error || "Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put("/auth/profile", { name, email });
      setUser(response.data.user);
      setMessage(t("update_success"));
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent>
              {user && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("name")}
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
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
                    {loading ? <Loading /> : t("update_profile")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
