"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import CustomSnackbar from "@/components/CustomSnackbar";
import { userApi } from "@/lib/axios";
//import api from "@/lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string; // لو هتضيف صورة مستخدم
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale ?? "ar";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken"); // 1. جلب التوكن من التخزين المحلي
      if (!token) throw new Error("Missing access token");

      const { data } = await userApi.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`, // 2. إرسال التوكن ضمن الهيدر
        },
      });

      // 3. حفظ بيانات المستخدم في الحالة بعد نجاح الطلب
      setUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
    } catch (err: any) {
      // 4. عرض رسالة خطأ مفهومة للمستخدم
      setSnackbar({
        message: `${t("error")}: ${err.response?.data?.message || err.message}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);


/*

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await userApi.get("/profile", { withCredentials: true });
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } catch (err: any) {
        setSnackbar({ message: `${t("error")}: ${err.response?.data?.message || err.message}`, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

*/

  const handleUpdate = async () => {
    setSnackbar(null);
    try {
      const { data } = await userApi.put("/update-profile", { name, email }, { withCredentials: true });
      setUser(data.user);
      setSnackbar({ message: t("update_success"), type: "success" });
      setIsEditing(false);
    } catch (err: any) {
      setSnackbar({ message: `${t("error")}: ${err.response?.data?.message || err.message}`, type: "error" });
    }
  };

  const goToChangePassword = () => router.push(`/${locale}/change-password`);

  if (loading) return <p className="text-center mt-20">{t("loading")}...</p>;
  if (!user) return <p className="text-center mt-20">{t("user_not_found")}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-xl p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-800 space-y-6"
      >
        {/* صورة المستخدم مع دوران خفيف */}
        <div className="flex justify-center mb-6 relative">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-400 border-l-transparent animate-spin-slow"></div>
            <div className="absolute inset-1/6 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800">
              <img
                src={user.avatar || "/logo.png"}
                alt="Avatar"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-gray-900 dark:text-gray-100">
          {t("title")}
        </h2>

        <div className="flex flex-col space-y-4">
          <div>
            <label className="font-semibold">{t("name")}</label>
            <input
              type="text"
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-3 border rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800"
              }`}
            />
          </div>

          <div>
            <label className="font-semibold">{t("email")}</label>
            <input
              type="email"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-3 border rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800"
              }`}
            />
          </div>
        </div>

        <div className="flex justify-between mt-4 gap-3">
          {!isEditing ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsEditing(true)}
              className="w-1/2 bg-blue-600 text-white py-3 rounded-2xl font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              {t("edit_profile")}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleUpdate}
              className="w-1/2 bg-blue-600 text-white py-3 rounded-2xl font-semibold shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {t("update_profile")}
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={goToChangePassword}
            className="w-1/2 bg-green-600 text-white py-3 rounded-2xl font-semibold shadow-lg hover:bg-green-700 transition"
          >
            {t("change_password")}
          </motion.button>
        </div>
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

/*

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale ?? "ar"; // fallback

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false); // للتحكم في إمكانية التعديل

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } catch (err: any) {
        setSnackbar({ message: `${t("error")}: ${err.message}`, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setSnackbar(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data.user);
      setSnackbar({ message: t("update_success"), type: "success" });
      setIsEditing(false); // ارجع الحقول للقراءة بعد التحديث
    } catch (err: any) {
      setSnackbar({ message: `${t("error")}: ${err.message}`, type: "error" });
    }
  };

  const goToChangePassword = () => router.push(`/${locale}/reset-password`);

  if (loading) return <p>{t("loading")}...</p>;
  if (!user) return <p>{t("user_not_found")}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 space-y-4">
        <h2 className="text-2xl font-bold text-center">{t("title")}</h2>

        <div className="flex flex-col space-y-3">
          <div>
            <label className="font-semibold">{t("name")}</label>
            <input
              type="text"
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-2 border rounded-xl ${!isEditing ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <label className="font-semibold">{t("email")}</label>
            <input
              type="email"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-2 border rounded-xl ${!isEditing ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>

        <div className="flex justify-between mt-4 gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              {t("edit_profile")}
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              {t("update_profile")}
            </button>
          )}

          <button
            onClick={goToChangePassword}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
          >
            {t("change_password")}
          </button>
        </div>
      </div>

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
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const params = useParams();
  const locale = params.locale ?? "ar"; // fallback
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } catch (err: any) {
        setSnackbar({ message: `${t("error")}: ${err.message}`, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setSnackbar(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data.user);
      setSnackbar({ message: t("update_success"), type: "success" });
    } catch (err: any) {
      setSnackbar({ message: `${t("error")}: ${err.message}`, type: "error" });
    }
  };

  const goToChangePassword = () => router.push(`/${locale}/reset-password`);

  if (loading) return <p>{t("loading")}...</p>;
  if (!user) return <p>{t("user_not_found")}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 space-y-4">
        <h2 className="text-2xl font-bold text-center">{t("title")}</h2>

        <div className="flex flex-col space-y-3">
          <div>
            <label className="font-semibold">{t("name")}</label>
            <input
              type="text"
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold">{t("email")}</label>
            <input
              type="email"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>
        </div>

        <div className="flex justify-between mt-4 gap-2">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {t("update_profile")}
          </button>

          <button
            onClick={goToChangePassword}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
          >
            {t("change_password")}
          </button>
        </div>
      </div>

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
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          method: "GET",
          credentials: "include", // مهم جداً عشان الكوكي يروح
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUser(data.user);
      } catch (err: any) {
        setSnackbar({ message: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p>{t("loading")}...</p>;
  if (!user) return <p>{t("user_not_found")}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 space-y-4">
        <h2 className="text-2xl font-bold text-center">{t("title")}</h2>

        {/* بيانات المستخدم *}
        <div className="flex flex-col space-y-2">
          <div>
            <span className="font-semibold">{t("name")}:</span> {user.name}
          </div>
          <div>
            <span className="font-semibold">{t("email")}:</span> {user.email}
          </div>
        </div>

        {/* أزرار لتغيير البيانات أو الباسورد *}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => window.location.href = "/profile/edit"} // صفحة لتعديل البيانات
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {t("edit_profile")}
          </button>

          <button
            onClick={() => window.location.href = "/change-password"} // صفحة تغيير الباسورد
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
          >
            {t("change_password")}
          </button>
        </div>
      </div>

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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import CustomSnackbar from "@/components/CustomSnackbar";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } catch (err: any) {
        setSnackbar({ message: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setSnackbar(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data.user);
      setSnackbar({ message: t("update_success"), type: "success" });
    } catch (err: any) {
      setSnackbar({ message: err.message, type: "error" });
    }
  };

  const goToChangePassword = () => {
    router.push(`/${locale}/reset-password`); // الرابط لصفحة تغيير الباسورد الموجودة
  };

  if (loading) return <p>{t("loading")}...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 space-y-4">
        <h2 className="text-2xl font-bold text-center">{t("title")}</h2>

        <div className="flex flex-col space-y-3">
          <label>{t("name")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />

          <label>{t("email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {t("update_profile")}
          </button>

          <button
            onClick={goToChangePassword}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
          >
            {t("change_password")}
          </button>
        </div>
      </div>

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

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import CustomSnackbar from "@/components/CustomSnackbar";
import { motion } from "framer-motion";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);
        setUser(data.user);
      } catch (err: any) {
        setSnackbar({ message: `${t("error")} ${err.message}`, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="text-center mt-10">{t("loading")}</p>;
  if (!user) return <p className="text-center mt-10">{t("no_user")}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-6 rounded-3xl shadow-2xl bg-white dark:bg-gray-800"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">{t("title")}</h2>

        <div className="space-y-4">
          <p>
            <span className="font-semibold">{t("name")}: </span>
            {user.name}
          </p>
          <p>
            <span className="font-semibold">{t("email")}: </span>
            {user.email}
          </p>
          <p>
            <span className="font-semibold">{t("role")}: </span>
            {user.role}
          </p>
        </div>

        <button
          onClick={() => router.push("/change-password")}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
        >
          {t("change_password")}
        </button>
      </motion.div>

      {snackbar && <CustomSnackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}
    </div>
  );
}



*/


/*

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomSnackbar from "@/components/CustomSnackbar";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUser(data.user);
      } catch (err: any) {
        setSnackbar({ message: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user)
    return (
      <div className="p-6">
        <p>User not found</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
      {snackbar && (
        <CustomSnackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />
      )}
    </div>
  );
}

*/
