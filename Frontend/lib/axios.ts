



// frontend/lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  withCredentials: true, // لإرسال cookies
});

// إضافة interceptor للأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إعادة توجيه إلى login إذا غير مصرح
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;


/*
// src/lib/axios.ts
import axios from "axios";

export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const userApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// إعداد interceptors
const setupInterceptors = (apiInstance: any) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status, data, config } = error.response;
        console.error("API Error:", {
          url: config?.url,
          status,
          data: data || "No response body",
        });
      } else {
        console.error("Network Error:", error.message);
      }
      return Promise.reject(error);
    }
  );
};

setupInterceptors(authApi);
setupInterceptors(userApi);

export default { authApi, userApi };

*/

/*
// src/lib/axios.ts
import axios from "axios";

export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const userApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// إعداد interceptors
const setupInterceptors = (apiInstance: any) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response)
        console.error("API Error:", error.response.data);
      else
        console.error("Network Error:", error.message);
      return Promise.reject(error);
    }
  );
};

setupInterceptors(authApi);
setupInterceptors(userApi);

export default { authApi, userApi };

*/

/*

// src/lib/axios.ts
import axios from "axios";

export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const userApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Interceptors مشتركين
const setupInterceptors = (apiInstance: typeof axios) => {
  apiInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) console.error("API Error:", error.response.data);
      else console.error("Network Error:", error.message);
      return Promise.reject(error);
    }
  );
};

setupInterceptors(authApi);
setupInterceptors(userApi);

export default { authApi, userApi };

*/

/*

// src/lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  withCredentials: true, // مهم جدًا عشان الكوكيز يتبعت تلقائي
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // مش هنضيف Authorization header يدوي
    // لأن الكوكيز هيتبعت أوتوماتيك لو السيرفر مظبوط (SameSite/Domain)
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

*/

/*

// src/lib/axios.ts
import axios from "axios";

// نعمل instance من Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // الرابط الأساسي (من .env)
  withCredentials: true, // عشان الكوكيز/التوكن لو محتاج
  timeout: 10000, // 10 ثواني max لكل request
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (لو عايز تبعت توكن في كل request)
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (عشان تمسك الأخطاء كلها في مكان واحد)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Errors من السيرفر
      console.error("API Error:", error.response.data);
    } else {
      // Errors من النت/التايم أوت
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

*/
