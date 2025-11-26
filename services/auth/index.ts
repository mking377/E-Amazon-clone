// services/auth/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./routes/auth";
import superAdminRoutes from "./routes/superAdminRoutes";
import { generalLimiter } from "../shared/rateLimiter";
import { config } from "../shared/config";

// فحص المتغيرات البيئية الأساسية (من config)
if (!config.mongoUri) {
  console.error("❌ MONGO_URI is required in environment variables");
  process.exit(1);
}

const app = express();

// إعداد CORS
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// ميدل وير للأمان والحد من الطلبات
app.use(helmet()); // إضافة headers أمنية
app.use(generalLimiter); // rate limiter من shared
app.use(express.json());
app.use(cookieParser());

// مسارات
app.use("/auth", authRoutes);
app.use("/superadmin", superAdminRoutes);

// اختبار الاتصال
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Auth service running" });
});

// معالجة الأخطاء العامة
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.message);
  if (err.message.includes("Only JPG and PNG")) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});

// اتصال بقاعدة البيانات وتشغيل السيرفر
mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log("✅ Connected to MongoDB (auth service)");
    app.listen(config.authPort, () => console.log(`🚀 Auth service running on port ${config.authPort}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
// cron job لتنظيف refresh tokens المنتهية (يومياً في منتصف الليل)
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`Cleaned up ${result.deletedCount} expired refresh tokens`);
  } catch (err) {
    console.error("Cron job error:", err);
  }
});

app.listen(config.authPort, () => console.log(`🚀 Auth service on port ${config.authPort}`));
/*
// services/auth/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import superAdminRoutes from "./routes/superAdminRoutes";

dotenv.config();

console.log("CWD:", process.cwd());
console.log("ENV PATH:", process.env.PWD);
// فحص المتغيرات البيئية الأساسية
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is required in environment variables");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// إعداد Rate Limiting لمنع الهجمات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: "Too many requests from this IP, please try again later.",
});

// إعداد CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// ميدل وير للأمان والحد من الطلبات
app.use(helmet()); // إضافة headers أمنية
app.use(limiter); // تطبيق rate limiting
app.use(express.json());
app.use(cookieParser());

// مسارات
app.use("/auth", authRoutes);
app.use("/superadmin", superAdminRoutes);

// اختبار الاتصال
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Auth service running" });
});

// معالجة الأخطاء العامة
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// اتصال بقاعدة البيانات وتشغيل السيرفر
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB (auth service)");
    app.listen(PORT, () => console.log(`🚀 Auth service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

*/

/*
// services/auth/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import superAdminRoutes from "./routes/superAdminRoutes";

dotenv.config();

// فحص المتغيرات البيئية الأساسية
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is required in environment variables");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// إعداد Rate Limiting لمنع الهجمات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: "Too many requests from this IP, please try again later.",
});

// إعداد CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// ميدل وير للأمان والحد من الطلبات
app.use(helmet()); // إضافة headers أمنية
app.use(limiter); // تطبيق rate limiting
app.use(express.json());
app.use(cookieParser());

// مسارات
app.use("/auth", authRoutes);
app.use("/superadmin", superAdminRoutes);

// اختبار الاتصال
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Auth service running" });
});

// معالجة الأخطاء العامة
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// اتصال بقاعدة البيانات وتشغيل السيرفر
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB (auth service)");
    app.listen(PORT, () => console.log(`🚀 Auth service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

*/

/*

// services/auth/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import superAdminRoutes from "./routes/superAdminRoutes";

dotenv.config();


const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
  })
);
app.use(express.json());
app.use(cookieParser());


*/
