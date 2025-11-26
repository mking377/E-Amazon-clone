"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

interface SnackbarState {
  message: string;
  type: "success" | "error";
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale ?? "en";
  const t = useTranslations("forgotPassword");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      await res.json().catch(() => ({}));
      // رسالة عامة حتى لو البريد غير موجود
      setSnackbar({ message: t("check_email"), type: "success" });
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.message || err}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(null);
    // بعد غلق الرسالة يمكن التحويل لو حبيت
    // router.replace(`/${locale}/login`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-2xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-800"
      >
     {/* اللوجو مع الدوران */}
     <div className="flex justify-center mb-6">
       <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
         {/* البوردر الدائري المتدرج */}
         <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-400 border-l-transparent animate-spin-slow"></div>
         {/* الصورة نفسها */}
         <div className="absolute inset-1/4 sm:inset-1/5 lg:inset-1/6 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800">
           <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
         </div>
       </div>
     </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
          🔑 {t("title")}
        </h2>

        <p className="text-sm text-gray-600 mb-4">{t("instruction")}</p>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm hover:shadow-md placeholder-black dark:placeholder-gray-400"
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 sm:py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50 transition"
          >
            {loading ? t("loading") : t("submit")}
          </motion.button>

          <div className="flex justify-between mt-2 text-sm sm:text-base">
            <button
              type="button"
              onClick={() => router.replace(`/${locale}/login`)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("backToLogin") ?? "تسجيل الدخول"}
            </button>
            <button
              type="button"
              onClick={() => router.replace(`/${locale}/register`)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("no_account") ?? "ليس لديك حساب؟"}
            </button>
          </div>
        </form>
      </motion.div>

      {snackbar && (
        <CustomSnackbar
          items={[{ id: Date.now(), message: snackbar.message, type: snackbar.type }]}
          onRemove={handleSnackbarClose}
        />
      )}
    </div>
  );
}




/*

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        credentials: "include", // يضمن إرسال الكوكيز إذا كان السيرفر يولد توكن
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // حتى لو البريد غير موجود، نرسل رسالة عامة
      await res.json().catch(() => ({}));
      const message = t("check_email"); // يتم جلب النص من ملف الترجمة
      setSnackbar({ message, type: "success" });
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.message || err}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-center mb-6">🔑 {t("title")}</h2>

        <p className="text-sm text-gray-600 mb-4">{t("instruction")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold shadow-md disabled:opacity-50"
          >
            {loading ? t("loading") : t("submit")}
          </motion.button>
        </form>
      </motion.div>

      {snackbar && (
        <CustomSnackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}

*/

/*

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        credentials: "include", // يضمن إرسال الكوكيز إذا كان السيرفر يولد توكن
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // حتى لو البريد مش موجود، نرسل رسالة عامة
      const data = await res.json().catch(() => ({}));
      const message = t("check_email"); // "إذا كان البريد موجود سيتم إرسال رابط إعادة التعيين"
      setSnackbar({ message, type: "success" });
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.message || err}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-center mb-6">🔑 {t("title")}</h2>

        <p className="text-sm text-gray-600 mb-4">
          {t("instruction")} {/* مثلا: "أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين" *}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold shadow-md disabled:opacity-50"
          >
            {loading ? t("loading") : t("submit")}
          </motion.button>
        </form>
      </motion.div>

      {snackbar && (
        <CustomSnackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}

*/
/*


"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        credentials: "include", // مهم لو الباك اند بيرجع كوكي
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || "Request failed";
        throw new Error(msg);
      }

      setSnackbar({ message: data?.message || t("success"), type: "success" });
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.message || err}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-center mb-6">🔑 {t("title")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-2 border rounded-lg"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold shadow-md disabled:opacity-50"
          >
            {loading ? t("loading") : t("submit")}
          </motion.button>
        </form>
      </motion.div>

      {snackbar && (
        <CustomSnackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}

*/

/*

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations("forgotPassword");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSnackbar({ message: t("success"), type: "success" });
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-center mb-6">🔑 {t("title")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-2 border rounded-lg"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold shadow-md disabled:opacity-50"
          >
            {loading ? t("loading") : t("submit")}
          </motion.button>
        </form>
      </motion.div>
      {snackbar && (
        <CustomSnackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}


*/
