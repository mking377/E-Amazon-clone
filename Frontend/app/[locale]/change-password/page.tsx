"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";
import api from "@/lib/axios";

// ✨ InputField مستقل
const InputField = ({
  type,
  placeholder,
  value,
  onChange,
  showToggle = false,
  showState,
  setShowState,
  locale,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  showToggle?: boolean;
  showState?: boolean;
  setShowState?: (val: boolean) => void;
  locale: string;
}) => (
  <div className="relative w-full">
    <input
      type={showToggle && showState ? "text" : type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl
                 focus:ring-2 focus:ring-blue-500 focus:outline-none
                 placeholder-black dark:placeholder-gray-400
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10"
    />
    {showToggle && setShowState && (
      <button
        type="button"
        className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 ${
          locale === "ar" ? "left-4" : "right-4"
        }`}
        onClick={() => setShowState(!showState)}
      >
        {showState ? "🙈" : "👁️"}
      </button>
    )}
  </div>
);

export default function ChangePasswordPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? "ar";
  const t = useTranslations("changePassword");

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // checks لقوة الباسورد
  const passwordChecks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-={}\[\]|:;"'<>,.?/]/.test(password),
    length: password.length >= 8,
  };
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrength = (passedChecks / 5) * 100;
  const strengthColor =
    passwordStrength < 40 ? "bg-red-500" : passwordStrength < 80 ? "bg-yellow-500" : "bg-green-500";

  const renderCheck = (passed: boolean, label: string) => (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <span>{passed ? "✅" : "❌"}</span>
      <span>{label}</span>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    if (password !== confirmPassword) {
      setSnackbar({ message: t("passwords_mismatch"), type: "error" });
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/change-password", {
        oldPassword,
        newPassword: password,
        confirmPassword,
      });
      setSnackbar({ message: t("success"), type: "success" });
      setTimeout(() => router.replace(`/${locale}/profile`), 2000);
    } catch (err: any) {
      setSnackbar({
        message: `${t("error")} ${err.response?.data?.message || err.message}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-800"
      >
        {/* ✨ اللوجو مع الدوران */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-400 border-l-transparent animate-spin-slow"></div>
            <div className="absolute inset-1/4 sm:inset-1/5 lg:inset-1/6 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
          🔑 {t("title")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <InputField
            type="password"
            placeholder={t("oldPassword")}
            value={oldPassword}
            onChange={setOldPassword}
            showToggle
            showState={showOld}
            setShowState={setShowOld}
            locale={locale}
          />
          <InputField
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={setPassword}
            showToggle
            showState={showNew}
            setShowState={setShowNew}
            locale={locale}
          />

          {/* Checks لقوة الباسورد */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-2 sm:space-y-3 shadow-inner">
            {renderCheck(passwordChecks.uppercase, t("uppercase"))}
            {renderCheck(passwordChecks.lowercase, t("lowercase"))}
            {renderCheck(passwordChecks.number, t("number"))}
            {renderCheck(passwordChecks.special, t("special"))}
            {renderCheck(passwordChecks.length, t("length"))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 h-3 rounded-xl overflow-hidden">
            <div
              className={`${strengthColor} h-3 transition-all duration-300`}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>

          <InputField
            type="password"
            placeholder={t("confirm")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            showToggle
            showState={showConfirm}
            setShowState={setShowConfirm}
            locale={locale}
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || passedChecks < 5 || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 sm:py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50 transition"
          >
            {loading ? t("loading") : t("submit")}
          </motion.button>
        </form>
      </motion.div>

      {snackbar && (
        <CustomSnackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => {
            if (snackbar.type === "success") router.replace(`/${locale}/profile`);
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
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";
import api from "@/lib/axios"; // نستخدم Axios بدل fetch

export default function ChangePasswordPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? "ar"; 
  const t = useTranslations("changePassword");

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // checks لقوة الباسورد
  const passwordChecks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-={}\[\]|:;"'<>,.?/]/.test(password),
    length: password.length >= 8,
  };
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrength = (passedChecks / 5) * 100;
  const strengthColor =
    passwordStrength < 40 ? "bg-red-500" : passwordStrength < 80 ? "bg-yellow-500" : "bg-green-500";

  const renderCheck = (passed: boolean, label: string) => (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <span>{passed ? "✅" : "❌"}</span>
      <span>{label}</span>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    // تنظيف المدخلات
    const trimmedOld = oldPassword.trim();
    const trimmedNew = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    // منع الباسورد يكون كله فراغات
    if (!trimmedOld || !trimmedNew || !trimmedConfirm) {
      setSnackbar({ message: t("empty_fields"), type: "error" });
      setLoading(false);
      return;
    }

    // تأكيد الباسورد
    if (trimmedNew !== trimmedConfirm) {
      setSnackbar({ message: t("passwords_mismatch"), type: "error" });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/change-password", {
        oldPassword: trimmedOld,
        newPassword: trimmedNew,
        confirmPassword: trimmedConfirm,
      });

      setSnackbar({ message: t("success"), type: "success" });
      setTimeout(() => router.replace(`/${locale}/profile`), 2000);
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.response?.data?.message || err.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // مكون input مع زر إظهار/إخفاء
  const InputField = ({
    type,
    placeholder,
    value,
    onChange,
    showToggle = false,
    showState,
    setShowState,
  }: {
    type: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    showToggle?: boolean;
    showState?: boolean;
    setShowState?: (val: boolean) => void;
  }) => (
    <div className="relative w-full">
      <input
        type={showToggle && showState ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-black dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10"
      />
      {showToggle && setShowState && (
        <button
          type="button"
          className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 ${
            locale === "ar" ? "left-4" : "right-4"
          }`}
          onClick={() => setShowState(!showState)}
        >
          {showState ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-800"
      >
     <div className="flex justify-center mb-6">
       <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
         <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-400 border-l-transparent animate-spin-slow"></div>
         <div className="absolute inset-1/4 sm:inset-1/5 lg:inset-1/6 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800">
           <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
         </div>
       </div>
     </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
          🔑 {t("title")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <InputField
            type="password"
            placeholder={t("oldPassword")}
            value={oldPassword}
            onChange={setOldPassword}
            showToggle
            showState={showOld}
            setShowState={setShowOld}
          />
          <InputField
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={setPassword}
            showToggle
            showState={showNew}
            setShowState={setShowNew}
          />
          {/* Checks لقوة الباسورد *}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-2 sm:space-y-3 shadow-inner">
            {renderCheck(passwordChecks.uppercase, t("uppercase"))}
            {renderCheck(passwordChecks.lowercase, t("lowercase"))}
            {renderCheck(passwordChecks.number, t("number"))}
            {renderCheck(passwordChecks.special, t("special"))}
            {renderCheck(passwordChecks.length, t("length"))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 h-3 rounded-xl overflow-hidden">
            <div
              className={`${strengthColor} h-3 transition-all duration-300`}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>
          <InputField
            type="password"
            placeholder={t("confirm")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            showToggle
            showState={showConfirm}
            setShowState={setShowConfirm}
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || passedChecks < 5 || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 sm:py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50 transition"
          >
            {loading ? t("loading") : t("submit")}
          </motion.button>
        </form>
      </motion.div>

      {snackbar && (
        <CustomSnackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => {
            if (snackbar.type === "success") {
              router.replace(`/${locale}/profile`);
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
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function ChangePasswordPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? "ar";
  const t = useTranslations("changePassword");

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // تحقق من قوة الباسورد
  const passwordChecks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]/.test(password),
    length: password.length >= 8,
    noSpaces: !/\s/.test(password), // منع الفراغات
  };
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrength = (passedChecks / 6) * 100;
  const strengthColor =
    passwordStrength < 40 ? "bg-red-500" : passwordStrength < 80 ? "bg-yellow-500" : "bg-green-500";

  const renderCheck = (passed: boolean, label: string) => (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <span>{passed ? "✅" : "❌"}</span>
      <span>{label}</span>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    const trimmedPassword = password.trim();
    const trimmedOldPassword = oldPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (trimmedPassword !== trimmedConfirmPassword) {
      setSnackbar({ message: t("passwords_mismatch"), type: "error" });
      setLoading(false);
      return;
    }

    if (/\s/.test(trimmedPassword)) {
      setSnackbar({ message: t("no_spaces"), type: "error" });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token"); // أو مكان تخزين التوكن
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: trimmedOldPassword,
          new_password: trimmedPassword,
          confirm_password: trimmedConfirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || "Error");

      setSnackbar({ message: t("success"), type: "success" });
      setTimeout(() => router.replace(`/${locale}/profile`), 2000);
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    type,
    placeholder,
    value,
    onChange,
    showToggle = false,
    showState,
    setShowState,
  }: {
    type: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    showToggle?: boolean;
    showState?: boolean;
    setShowState?: (val: boolean) => void;
  }) => (
    <div className="relative w-full">
      <input
        type={showToggle && showState ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-black dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10"
      />
      {showToggle && setShowState && (
        <button
          type="button"
          className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 ${
            locale === "ar" ? "left-4" : "right-4"
          }`}
          onClick={() => setShowState(!showState)}
        >
          {showState ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-800"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
          🔑 {t("title")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <InputField
            type="password"
            placeholder={t("oldPassword")}
            value={oldPassword}
            onChange={setOldPassword}
            showToggle
            showState={showOld}
            setShowState={setShowOld}
          />
          <InputField
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={setPassword}
            showToggle
            showState={showNew}
            setShowState={setShowNew}
          />
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-2 sm:space-y-3 shadow-inner">
            {renderCheck(passwordChecks.uppercase, t("uppercase"))}
            {renderCheck(passwordChecks.lowercase, t("lowercase"))}
            {renderCheck(passwordChecks.number, t("number"))}
            {renderCheck(passwordChecks.special, t("special"))}
            {renderCheck(passwordChecks.length, t("length"))}
            {renderCheck(passwordChecks.noSpaces, t("no_spaces"))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 h-3 rounded-xl overflow-hidden">
            <div className={`${strengthColor} h-3 transition-all duration-300`} style={{ width: `${passwordStrength}%` }} />
          </div>
          <InputField
            type="password"
            placeholder={t("confirm")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            showToggle
            showState={showConfirm}
            setShowState={setShowConfirm}
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || passedChecks < 6 || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 sm:py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50 transition"
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
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function ChangePasswordPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? "ar"; // تحديد اللغة
  const t = useTranslations("changePassword");

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
    passwordStrength < 40 ? "bg-red-500" : passwordStrength < 80 ? "bg-yellow-500" : "bg-green-500";

  const renderCheck = (passed: boolean, label: string) => (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <span>{passed ? "✅" : "❌"}</span>
      <span>{label}</span>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    const trimmedPassword = password.trim();
    const trimmedOldPassword = oldPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (trimmedPassword !== trimmedConfirmPassword) {
      setSnackbar({ message: t("passwords_mismatch"), type: "error" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldPassword: trimmedOldPassword,
          newPassword: trimmedPassword,
          confirmPassword: trimmedConfirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSnackbar({ message: t("success"), type: "success" });
      setTimeout(() => router.replace(`/${locale}/profile`), 2000);
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    type,
    placeholder,
    value,
    onChange,
    showToggle = false,
    showState,
    setShowState,
  }: {
    type: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    showToggle?: boolean;
    showState?: boolean;
    setShowState?: (val: boolean) => void;
  }) => (
    <div className="relative w-full">
      <input
        type={showToggle && showState ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-black dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10"
      />
      {showToggle && setShowState && (
        <button
          type="button"
          className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 ${
            locale === "ar" ? "left-4" : "right-4"
          }`}
          onClick={() => setShowState(!showState)}
        >
          {showState ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-800"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
          🔑 {t("title")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <InputField
            type="password"
            placeholder={t("oldPassword")}
            value={oldPassword}
            onChange={setOldPassword}
            showToggle
            showState={showOld}
            setShowState={setShowOld}
          />
          <InputField
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={setPassword}
            showToggle
            showState={showNew}
            setShowState={setShowNew}
          />
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-2 sm:space-y-3 shadow-inner">
            {renderCheck(passwordChecks.uppercase, t("uppercase"))}
            {renderCheck(passwordChecks.lowercase, t("lowercase"))}
            {renderCheck(passwordChecks.number, t("number"))}
            {renderCheck(passwordChecks.special, t("special"))}
            {renderCheck(passwordChecks.length, t("length"))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 h-3 rounded-xl overflow-hidden">
            <div className={`${strengthColor} h-3 transition-all duration-300`} style={{ width: `${passwordStrength}%` }} />
          </div>
          <InputField
            type="password"
            placeholder={t("confirm")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            showToggle
            showState={showConfirm}
            setShowState={setShowConfirm}
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || passedChecks < 5 || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 sm:py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50 transition"
          >
            {loading ? t("loading") : t("submit")}
          </motion.button>
        </form>
      </motion.div>

      {snackbar && (
        <CustomSnackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => {
            if (snackbar.type === "success") {
              router.replace(`/${locale}/profile`);
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
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function ChangePasswordPage() {
  const router = useRouter();
  const t = useTranslations("changePassword"); // يمكن تغيير key للترجمة

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const passwordChecks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]/.test(password),
    length: password.length >= 8,
  };
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrength = (passedChecks / 5) * 100;
  const strengthColor = passwordStrength < 40 ? "bg-red-500" : passwordStrength < 80 ? "bg-yellow-500" : "bg-green-500";

  const renderCheck = (passed: boolean, label: string) => (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <span>{passed ? "✅" : "❌"}</span>
      <span>{label}</span>
    </div>
  );

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setSnackbar(null);

  const trimmedPassword = password.trim();
  const trimmedOldPassword = oldPassword.trim();
  const trimmedConfirmPassword = confirmPassword.trim();

  if (trimmedPassword !== trimmedConfirmPassword) {
    setSnackbar({ message: t("passwords_mismatch"), type: "error" });
    setLoading(false);
    return;
  }

  // بعد كده تستخدم القيم المقطوعة في fetch
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ oldPassword: trimmedOldPassword, newPassword: trimmedPassword, confirmPassword: trimmedConfirmPassword })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setSnackbar({ message: t("success"), type: "success" });
    setTimeout(() => router.push("/profile"), 2000);
  } catch (err: any) {
    setSnackbar({ message: `${t("error")} ${err.message}`, type: "error" });
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-800"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
          🔑 {t("title")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* كلمة المرور القديمة *}
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              id="oldPassword"
	      name="oldPassword"
	      placeholder={t("oldPassword")}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full px-4 
py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2
 focus:ring-blue-500 focus:outline-none placeholder-black dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10"
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300" onClick={() => setShowOld(prev => !prev)}>
              {showOld ? "🙈" : "👁️"}
            </button>
          </div>

          {/* كلمة المرور الجديدة *}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              id="newPassword"
              name="newPassword"
	      placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-black dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10"
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300" onClick={() => setShowNew(prev => !prev)}>
              {showNew ? "🙈" : "👁️"}
            </button>
          </div>

          {/* تحقق قوة الباسورد *}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-2 sm:space-y-3 shadow-inner">
            {renderCheck(passwordChecks.uppercase, t("uppercase"))}
            {renderCheck(passwordChecks.lowercase, t("lowercase"))}
            {renderCheck(passwordChecks.number, t("number"))}
            {renderCheck(passwordChecks.special, t("special"))}
            {renderCheck(passwordChecks.length, t("length"))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 h-3 rounded-xl overflow-hidden">
            <div className={`${strengthColor} h-3 transition-all duration-300`} style={{ width: `${passwordStrength}%` }} />
          </div>

          {/* تأكيد كلمة المرور الجديدة *}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              id="confirm"
              name="confirm"
              placeholder={t("confirm")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-black dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10"
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300" onClick={() => setShowConfirm(prev => !prev)}>
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || passedChecks < 5 || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 sm:py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50 transition"
          >

           {loading ? t("loading") : t("submit")}
          </motion.button>
        </form>
      </motion.div>

      {snackbar && (
        <CustomSnackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />
      )}
    </div>
  );
}

*/

