// services/shared/config.ts
import dotenv from "dotenv";
import path from "path";

// تحميل .env من services/shared/.env
dotenv.config({ path: path.resolve(__dirname, ".env") });

export const config = {
  jwtSecret: process.env.JWT_SECRET || "default_secret",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "default-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/default",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  authPort: process.env.AUTH_PORT || 5001,
  cartPort: process.env.CART_PORT || 5002,
  // أضف باقي المنافذ والمتغيرات حسب الحاجة
  rateLimitMax: process.env.AUTH_RATE_LIMIT_MAX || 5,
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  baseUrl: process.env.BASE_URL || "http://localhost:5001",
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: parseInt(process.env.EMAIL_PORT || "587"),
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  // إلخ...
};

/*

// services/shared/config.ts
import dotenv from "dotenv";
import path from "path";

// تحميل .env من مجلد shared
dotenv.config({ path: path.resolve(__dirname, ".env") });

export const config = {
  jwtSecret: process.env.JWT_SECRET || "default_secret", // قديم، يمكن إزالته لاحقاً
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "default-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/default",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

*/

/*
// services/shared/config.ts
import dotenv from "dotenv";
import path from "path";

// تحميل .env من مجلد shared
dotenv.config({ path: path.resolve(__dirname, ".env") });

export const config = {
  jwtSecret: process.env.JWT_SECRET || "default_secret",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/default",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
*/
