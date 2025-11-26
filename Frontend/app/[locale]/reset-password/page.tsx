"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";
import api from "@/lib/axios";
const InputField = ({
  type,
  placeholderKey,
  value,
  onChange,
  required = false,
  showToggle = false,
  locale,
}: {
  type: string;
  placeholderKey: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  showToggle?: boolean;
  locale: string;
}) => {
  const t = useTranslations("ResetPassword");
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col w-full relative">
      <label
        htmlFor={placeholderKey}
        className="mb-1 font-medium text-gray-700 dark:text-gray-200"
      >
        {t(placeholderKey)}
      </label>
      <input
        id={placeholderKey}
        name={placeholderKey}
        type={showToggle ? (visible ? "text" : "password") : type}
        placeholder={t(placeholderKey)}
        autoComplete={
          placeholderKey === "newPassword" || placeholderKey === "confirmPassword"
            ? "new-password"
            : "off"
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl
                   focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm hover:shadow-md"
      />
      {showToggle && (
        <button
          type="button"
          className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 ${
            locale === "ar" ? "left-4" : "right-4"
          }`}
          onClick={() => setVisible((prev) => !prev)}
        >
          {visible ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) ?? "ar";
  const token = searchParams.get("token");
  const t = useTranslations("ResetPassword");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setSnackbar({ message: t("invalidLink"), type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setSnackbar({ message: t("passwordMismatch"), type: "error" });
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/reset-password", {
        token,
        password,
      });

      setSnackbar({ message: t("success"), type: "success" });
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.response?.data?.message || err.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full space-y-6"
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
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {t("title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="password"
            placeholderKey="newPassword"
            value={password}
            onChange={setPassword}
            required
            showToggle
            locale={locale}
          />
          <InputField
            type="password"
            placeholderKey="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            showToggle
            locale={locale}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition disabled:opacity-50"
          >
            {loading ? t("loading") : t("submit")}
          </button>
        </form>
      </motion.div>

      {snackbar && (
        <CustomSnackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => {
            if (snackbar.type === "success") {
              router.replace(`/${locale}/login`);
            }
            setSnackbar(null);
          }}
        />
      )}
    </div>
  );
}


/*

"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

const InputField = ({
  type,
  placeholderKey,
  value,
  onChange,
  required = false,
  showToggle = false,
  locale,
}: {
  type: string;
  placeholderKey: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  showToggle?: boolean;
  locale: string;
}) => {
  const t = useTranslations("ResetPassword");
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col w-full relative">
      <label
        htmlFor={placeholderKey}
        className="mb-1 font-medium text-gray-700 dark:text-gray-200"
      >
        {t(placeholderKey)}
      </label>
      <input
        id={placeholderKey}
        name={placeholderKey}
        type={showToggle ? (visible ? "text" : "password") : type}
        placeholder={t(placeholderKey)}
        autoComplete={
          placeholderKey === "newPassword" || placeholderKey === "confirmPassword"
            ? "new-password"
            : "off"
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl
                   focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm hover:shadow-md"
      />
      {showToggle && (
        <button
          type="button"
          className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 ${
            locale === "ar" ? "left-4" : "right-4"
          }`}
          onClick={() => setVisible((prev) => !prev)}
        >
          {visible ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) ?? "ar";
  const token = searchParams.get("token");
  const t = useTranslations("ResetPassword");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setSnackbar({ message: t("invalidLink"), type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setSnackbar({ message: t("passwordMismatch"), type: "error" });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {t("title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="password"
            placeholderKey="newPassword"
            value={password}
            onChange={setPassword}
            required
            showToggle
            locale={locale}
          />
          <InputField
            type="password"
            placeholderKey="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            showToggle
            locale={locale}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition disabled:opacity-50"
          >
            {loading ? t("loading") : t("submit")}
          </button>
        </form>
      </motion.div>

      {snackbar && (
        <CustomSnackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => {
            if (snackbar.type === "success") {
              router.replace(`/${locale}/login`);
            }
            setSnackbar(null);
          }}
        />
      )}
    </div>
  );
}

*/


/*

"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSnackbar } from "@/context/snackbarContext";

const InputField = ({
  type,
  placeholderKey,
  value,
  onChange,
  required = false,
  showToggle = false,
  locale,
}: {
  type: string;
  placeholderKey: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  showToggle?: boolean;
  locale: string;
}) => {
  const t = useTranslations("ResetPassword");
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col w-full relative">
      <label
        htmlFor={placeholderKey}
        className="mb-1 font-medium text-gray-700 dark:text-gray-200"
      >
        {t(placeholderKey)}
      </label>
      <input
        id={placeholderKey}
        name={placeholderKey}
        type={showToggle ? (visible ? "text" : "password") : type}
        placeholder={t(placeholderKey)}
        autoComplete={
          placeholderKey === "newPassword" || placeholderKey === "confirmPassword"
            ? "new-password"
            : "off"
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl
                   focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm hover:shadow-md"
      />
      {showToggle && (
        <button
          type="button"
          className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 ${
            locale === "ar" ? "left-4" : "right-4"
          }`}
          onClick={() => setVisible((prev) => !prev)}
        >
          {visible ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) ?? "ar";
  const token = searchParams.get("token");
  const t = useTranslations("ResetPassword");
  const { showSnackbar } = useSnackbar();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // حساب قوة الباسورد
  const passwordChecks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]/.test(password),
    length: password.length >= 8,
  };
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrength = (passedChecks / 5) * 100;
  const strengthColor =
    passwordStrength < 40
      ? "bg-red-500"
      : passwordStrength < 80
      ? "bg-yellow-500"
      : "bg-green-500";

  const renderCheck = (passed: boolean, labelKey: string) => (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <span>{passed ? "✅" : "❌"}</span>
      <span>{t(labelKey)}</span>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showSnackbar(t("invalidLink"), "error");
      return;
    }

    if (password !== confirmPassword) {
      showSnackbar(t("passwordMismatch"), "error");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      showSnackbar(t("success"), "success", () => {
        router.push(`/${locale}/login`);
      });
    } catch (err: any) {
      showSnackbar(`${t("error")} ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6"
      >
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-14 sm:h-16 lg:h-20" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {t("title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="password"
            placeholderKey="newPassword"
            value={password}
            onChange={setPassword}
            required
            showToggle
            locale={locale}
          />
          <InputField
            type="password"
            placeholderKey="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            showToggle
            locale={locale}
          />

          {/* شريط قوة الباسورد *}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-2 sm:space-y-3 shadow-inner">
            {renderCheck(passwordChecks.uppercase, "uppercase")}
            {renderCheck(passwordChecks.lowercase, "lowercase")}
            {renderCheck(passwordChecks.number, "number")}
            {renderCheck(passwordChecks.special, "special")}
            {renderCheck(passwordChecks.length, "length")}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 h-3 rounded-xl overflow-hidden">
            <div
              className={`${strengthColor} h-3 transition-all duration-300`}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || passedChecks < 5 || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-2xl transition disabled:opacity-50"
          >
            {loading ? t("loading") : t("submit")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

*/

