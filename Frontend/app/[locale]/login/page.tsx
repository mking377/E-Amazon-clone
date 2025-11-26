"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

interface InputFieldProps {
  type: string;
  placeholderKey: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  showToggle?: boolean;
  locale: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholderKey,
  value,
  onChange,
  required = false,
  showToggle = false,
  locale,
}) => {
  const t = useTranslations("login");
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col w-full relative">
      <label htmlFor={placeholderKey} className="mb-1 font-medium text-gray-700 dark:text-gray-200">
        {t(placeholderKey)}
      </label>
      <input
        type={showToggle ? (visible ? "text" : "password") : type}
        id={placeholderKey}
        name={placeholderKey}
        placeholder={t(placeholderKey)}
        autoComplete={
          placeholderKey === "email" ? "email" :
          placeholderKey === "password" ? "new-password" :
          placeholderKey === "name" ? "name" :
          undefined
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm hover:shadow-md placeholder-black dark:placeholder-gray-400"
      />
      {showToggle && (
        <button
          type="button"
          className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 ${
            locale === "ar" ? "left-4" : "right-4"
          }`}
          onClick={() => setVisible(prev => !prev)}
        >
          {visible ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );
};

interface SnackbarState {
  message: string;
  type: "success" | "error";
}

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale ?? "en";
  const t = useTranslations("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setSnackbar(null);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Login failed");

    // ✅ حفظ التوكن بعد تسجيل الدخول
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

    setSnackbar({ message: t("success"), type: "success" });
    router.replace(`/${locale}/profile`);
  } catch (err: any) {
    setSnackbar({ message: `${t("error")} ${err.message || err}`, type: "error" });
  } finally {
    setLoading(false);
  }
};
/*

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Login failed");

      setSnackbar({ message: t("success"), type: "success" });
      router.replace(`/${locale}/profile`);

    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.message || err}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

*/

  const handleSnackbarClose = () => {
    setSnackbar(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-2xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-800"
      >
	<div className="flex justify-center mb-6">
	  <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
	    {/* البوردر الدائري المتدرج */}
	    <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-400 border-l-transparent animate-spin-slow"></div>

	    {/* الصورة نفسها تبقى في النص */}
	    <div className="absolute inset-1/4 sm:inset-1/5 lg:inset-1/6 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800">
	      <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
	    </div>
	  </div>
	</div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
          {t("title")}
        </h2>

        <form onSubmit={handleLogin} className="space-y-6 sm:space-y-8">
          <InputField type="email" placeholderKey="email" value={email} onChange={setEmail} required locale={locale} />
          <InputField type="password" placeholderKey="password" value={password} onChange={setPassword} required showToggle locale={locale} />

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
              onClick={() => router.replace(`/${locale}/forgot-password`)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("forgotPassword")}
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
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

interface InputFieldProps {
  type: string;
  placeholderKey: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  showToggle?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholderKey,
  value,
  onChange,
  required = false,
  showToggle = false,
}) => {
  const t = useTranslations("login");
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col w-full relative">
      <label htmlFor={placeholderKey} className="mb-1 font-medium text-gray-700 dark:text-gray-200">
        {t(placeholderKey)}
      </label>
      <input
        type={showToggle ? (visible ? "text" : "password") : type}
        id={placeholderKey}
        name={placeholderKey}
        placeholder={t(placeholderKey)}
        autoComplete={
          placeholderKey === "email" ? "email" :
          placeholderKey === "password" ? "new-password" :
          placeholderKey === "name" ? "name" :
          undefined
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="px-4 py-3 border border-gray-300 dark:border-gray-600 
rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm hover:shadow-md placeholder-black dark:placeholder-gray-400"
      />
      {showToggle && (
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
          onClick={() => setVisible(prev => !prev)}
        >
          {visible ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );
};

interface SnackbarState {
  message: string;
  type: "success" | "error";
}

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale ?? "en";
  const t = useTranslations("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Login failed");

      // عرض رسالة نجاح
      setSnackbar({ message: t("success"), type: "success" });
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.message || err}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(null);
    // بعد غلق الرسالة فقط، يتم تحويل المستخدم
    router.push(`/${locale}/profile`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-2xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-800"
      >
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-14 sm:h-16 lg:h-20" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
          {t("title")}
        </h2>

        <form onSubmit={handleLogin} className="space-y-6 sm:space-y-8">
          <InputField type="email" placeholderKey="email" value={email} onChange={setEmail} required />
          <InputField type="password" placeholderKey="password" value={password} onChange={setPassword} required showToggle />

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
              onClick={() => router.push(`/${locale}/forgot-password`)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("forgotPassword")}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/register`)}
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

*/


/*

"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

interface InputFieldProps {
  type: string;
  placeholderKey: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  showToggle?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholderKey,
  value,
  onChange,
  required = false,
  showToggle = false,
}) => {
  const t = useTranslations("login");
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col w-full relative">
      <label htmlFor={placeholderKey} className="mb-1 font-medium text-gray-700 dark:text-gray-200"> {t(placeholderKey)}</label>
      <input
        type={showToggle ? (visible ? "text" : "password") : type}
        id={placeholderKey}
        name={placeholderKey}
        placeholder={t(placeholderKey)}
        autoComplete={
 	 placeholderKey === "email" ? "email" :
  	 placeholderKey === "password" ? "new-password" :
  	 placeholderKey === "name" ? "name" :
  	 undefined }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm hover:shadow-md placeholder-black dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full"
      />
      {showToggle && (
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
          onClick={() => setVisible((prev) => !prev)}
        >
          {visible ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );
};

interface SnackbarState {
  message: string;
  type: "success" | "error";
}

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale ?? "en"; // التحقق من اللغة
  const t = useTranslations("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || "Login failed");

      setSnackbar({ message: t("success"), type: "success" });

      // التحويل بعد نجاح تسجيل الدخول فقط
      setTimeout(() => router.push(`/${locale}/profile`), 1200);
    } catch (err: any) {
      setSnackbar({ message: `${t("error")} ${err.message || err}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-2xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-800"
      >
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-14 sm:h-16 lg:h-20" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
          {t("title")}
        </h2>

        <form onSubmit={handleLogin} className="space-y-6 sm:space-y-8">
          <InputField type="email" placeholderKey="email" value={email} onChange={setEmail} required />
          <InputField type="password" placeholderKey="password" value={password} onChange={setPassword} required showToggle />

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
              onClick={() => router.push(`/${locale}/reset-password`)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("forgotPassword")}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/register`)}
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
          onRemove={() => setSnackbar(null)}
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

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // مهم: يسمح باستلام الكوكي HttpOnly من السيرفر
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || "Login failed";
        throw new Error(msg);
      }

      // الباك-إند يجب أن يرسل الكوكي HttpOnly. هنا نستخدم فقط رد السيرفر لعرض الحالة.
      setSnackbar({ message: t("success"), type: "success" });
      // يمكن إرجاع بيانات المستخدم في body لو احتجت عرضها
      setTimeout(() => router.push("/"), 1200);
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
        transition={{ duration: 0.35 }}
        className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-center mb-6">🔑 {t("title")}</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-2 border rounded-lg"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-2 flex items-center text-sm"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

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
// 👆 من الـ alias بدل ما تكتب ../components

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSnackbar({ message: t("success"), type: "success" });
      setTimeout(() => router.push("/"), 1500);
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
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-2 border rounded-lg"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center text-sm"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

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

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSnackbar({ message: t("success"), type: "success" });
      setTimeout(() => router.push("/"), 1500); // بعد تسجيل الدخول نروح للصفحة الرئيسية
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
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-2 border rounded-lg"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center text-sm"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

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

interface ApiResponse {
  token?: string;
  error?: string;
  message?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData: ApiResponse = await res.json();
        throw new Error(errorData.error || errorData.message || "Login failed");
      }

      const data: ApiResponse = await res.json();

      if (data.token) {
        // يفضل استخدام HttpOnly cookies بدل localStorage
        localStorage.setItem("token", data.token);
        setMessage("✅ تم تسجيل الدخول بنجاح");
      } else {
        setMessage("❌ حدث خطأ غير متوقع");
      }
    } catch (err: any) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          🔑 تسجيل الدخول
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold shadow-md transition-transform disabled:opacity-60"
          >
            {loading ? "⏳ جاري الدخول..." : "🚀 دخول"}
          </motion.button>
        </form>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm font-medium text-gray-700"
          >
            {message}
          </motion.p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          ما عندكش حساب؟{" "}
          <a
            href="/register"
            className="text-purple-700 font-medium hover:underline"
          >
            سجل دلوقتي
          </a>
        </p>
      </motion.div>
    </div>
  );
}


*)

/*


"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setMessage("✅ Logged in successfully!");
      } else {
        setMessage("❌ " + (data.error || data.message));
      }
    } catch (err) {
      setMessage("⚠️ Error connecting to server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          🔑 تسجيل الدخول
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold shadow-md transition-transform"
          >
            🚀 دخول
          </motion.button>
        </form>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm font-medium text-gray-700"
          >
            {message}
          </motion.p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          ما عندكش حساب؟{" "}
          <a
            href="/register"
            className="text-purple-600 font-medium hover:underline"
          >
            سجل دلوقتي
          </a>
        </p>
      </motion.div>
    </div>
  );
}

*/

/*

"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setMessage("✅ Logged in successfully!");
      } else {
        setMessage("❌ " + (data.error || data.message));
      }
    } catch (err) {
      setMessage("⚠️ Error connecting to server");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

*/
