import express, { Request, Response, NextFunction } from "express";
import httpProxy from "express-http-proxy";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // غيرها في الإنتاج!

// إعداد الأمان: Helmet للـ headers الأمنية
app.use(helmet());

// إعداد Rate Limiting: حد أقصى 100 طلب كل 15 دقيقة
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// إعداد CORS: محدود للـ origin المحدد، مع السماح بطرق محددة
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"], // طرق مسموحة فقط
}));

// ميدل وير لتسجيل الطلبات (بدون تسجيل بيانات حساسة)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[Gateway] ${req.method} ${req.path}`);
  next();
});

// Middleware للمصادقة: التحقق من JWT token
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded; // إضافة المستخدم إلى الطلب
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Middleware للترخيص: التحقق من الـ role
const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

// البروكسيات مع تحسينات
const services = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  user: process.env.USER_SERVICE_URL || "http://localhost:5002",
  orders: process.env.ORDERS_SERVICE_URL || "http://localhost:5003",
  products: process.env.PRODUCTS_SERVICE_URL || "http://localhost:5004",
};

// خيارات الـ proxy: timeout ومعالجة الأخطاء
/*
   احذف التعليق في حاله عدم عمل الكود الاخر
const proxyOptions = {
  proxyErrorHandler: (err: any, res: Response) => {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: "Service unavailable" });
  },
};

*/
const proxyOptions = {
  timeout: 5000, // 5 ثواني timeout
  proxyErrorHandler: (err: any, res: Response, next: NextFunction) => {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: "Service unavailable" });
  },
};

// توجيه الطلبات مع الصلاحيات
// /auth: متاح للجميع (للـ login/signup)
app.use("/auth", httpProxy(services.auth, proxyOptions));

// /user: فقط لـ admin و super admin
app.use("/user", authenticate, authorize(["admin", "super_admin"]), httpProxy(services.user, proxyOptions));

// /orders: لـ manager، admin، super admin
app.use("/orders", authenticate, authorize(["manager", "admin", "super_admin"]), httpProxy(services.orders, proxyOptions));

// /products: متاح للجميع (أو غير حسب الحاجة)
app.use("/products", httpProxy(services.products, proxyOptions));

// مسار رئيسي للتجربة
app.get("/", (_req: Request, res: Response) => {
  res.send("API Gateway is running");
});

// معالجة الأخطاء العامة
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("General error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚪 Gateway running on port ${PORT}`);
});
