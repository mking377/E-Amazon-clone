// services/auth/routes/auth.ts
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  requireVerified,
} from "../controllers/authController";
import { validateRegister, validateLogin, authenticateToken } from "../../shared/authMiddleware";
import { authLimiter } from "../../shared/rateLimiter";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

// تسجيل مستخدم جديد
router.post("/register", validateRegister, registerUser);

// تسجيل الدخول
router.post("/login", authLimiter, validateLogin, loginUser);

// تسجيل الخروج
router.post("/logout", logoutUser);

// التحقق من صلاحية التوكن
router.get("/verify", verifyToken);

// تجديد access token
router.post("/refresh", refreshAccessToken);

// التحقق من البريد الإلكتروني
router.get("/verify-email", verifyEmail);

// نسيان كلمة المرور
router.post("/forgot-password", forgotPassword);

// إعادة تعيين كلمة المرور
router.post("/reset-password", resetPassword);

// عرض الملف الشخصي
router.get("/profile", authenticateToken, getProfile); 

// تحديث الملف الشخصي
router.put("/profile", upload.single("avatar"), authenticateToken, updateProfile);

// تغيير كلمة المرور (محمي)
router.put("/change-password", authenticateToken, changePassword);

export default router;


/*

// services/auth/routes/auth.ts
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController";
import { authenticateToken } from "../../shared/authMiddleware";  // استورد فقط authenticateToken
import { authLimiter } from "../../shared/rateLimiter";

const router = Router();

// middleware محلي للregister (مؤقت)
const validateRegister = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required, including confirm password." });
  }
  next();
};

// middleware محلي للlogin (مؤقت)
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  next();
};

// تسجيل مستخدم جديد
router.post("/register", validateRegister, registerUser);

// تسجيل الدخول
router.post("/login", authLimiter, validateLogin, loginUser);

// تسجيل الخروج
router.post("/logout", logoutUser);

// التحقق من صلاحية التوكن
router.get("/verify", verifyToken);

// تجديد access token
router.post("/refresh", refreshAccessToken);

// التحقق من البريد الإلكتروني
router.post("/verify-email", verifyEmail);

// نسيان كلمة المرور
router.post("/forgot-password", forgotPassword);

// إعادة تعيين كلمة المرور
router.post("/reset-password", resetPassword);

// عرض الملف الشخصي
router.get("/profile", authenticateToken, getProfile);

// تحديث الملف الشخصي
router.put("/profile", authenticateToken, updateProfile);



port default router;


*/

/*



// services/auth/routes/auth.ts
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController";
import { validateRegister, validateLogin, authenticateToken } from "../../shared/authMiddleware";  // استورد الثلاثة
import { authLimiter } from "../../shared/rateLimiter";

const router = Router();

// تسجيل مستخدم جديد
router.post("/register", validateRegister, registerUser);

// تسجيل الدخول
router.post("/login", authLimiter, validateLogin, loginUser);

// تسجيل الخروج
router.post("/logout", logoutUser);

// التحقق من صلاحية التوكن
router.get("/verify", verifyToken);

// تجديد access token
router.post("/refresh", refreshAccessToken);

// التحقق من البريد الإلكتروني
router.post("/verify-email", verifyEmail);

// نسيان كلمة المرور
router.post("/forgot-password", forgotPassword);

// إعادة تعيين كلمة المرور
router.post("/reset-password", resetPassword);

// عرض الملف الشخصي
router.get("/profile", authenticateToken, getProfile);

// تحديث الملف الشخصي
router.put("/profile", authenticateToken, updateProfile);

export default router;

*/

/*

// services/auth/routes/auth.ts
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController";
import { authenticateToken } from "../../shared/authMiddleware";  // استورد فقط authenticateToken
import { authLimiter } from "../../shared/rateLimiter";

const router = Router();

// middleware بسيط للregister
const validateRegister = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required, including confirm password." });
  }
  next();
};

// middleware بسيط للlogin
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  next();
};

// تسجيل مستخدم جديد
router.post("/register", validateRegister, registerUser);

// تسجيل الدخول
router.post("/login", authLimiter, validateLogin, loginUser);

// تسجيل الخروج
router.post("/logout", logoutUser);

// التحقق من صلاحية التوكن
router.get("/verify", verifyToken);

// تجديد access token
router.post("/refresh", refreshAccessToken);

// التحقق من البريد الإلكتروني
router.post("/verify-email", verifyEmail);

// نسيان كلمة المرور
router.post("/forgot-password", forgotPassword);

// إعادة تعيين كلمة المرور
router.post("/reset-password", resetPassword);

// عرض الملف الشخصي
router.get("/profile", authenticateToken, getProfile);

// تحديث الملف الشخصي
router.put("/profile", authenticateToken, updateProfile);

export default router;

*/



/*

// services/auth/routes/auth.ts
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController";
import { validateRegister, validateLogin, authenticateToken } from "../../shared/authMiddleware";
import { authLimiter } from "../../shared/rateLimiter";

const router = Router();

// تسجيل مستخدم جديد
router.post("/register", validateRegister, registerUser);

// تسجيل الدخول
router.post("/login", authLimiter, validateLogin, loginUser);

// تسجيل الخروج
router.post("/logout", logoutUser);

// التحقق من صلاحية التوكن
router.get("/verify", verifyToken);

// تجديد access token
router.post("/refresh", refreshAccessToken);

// التحقق من البريد الإلكتروني
router.post("/verify-email", verifyEmail);

// نسيان كلمة المرور
router.post("/forgot-password", forgotPassword);

// إعادة تعيين كلمة المرور
router.post("/reset-password", resetPassword);

// عرض الملف الشخصي
router.get("/profile", authenticateToken, getProfile);

// تحديث الملف الشخصي
router.put("/profile", authenticateToken, updateProfile);

export default router;

*/

/*

// services/auth/routes/auth.ts
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController";
import { validateInput, authenticateToken } from "../../shared/authMiddleware";
import { authLimiter } from "../../shared/rateLimiter";

const router = Router();

// تسجيل مستخدم جديد
router.post("/register", validateInput, registerUser);

// تسجيل الدخول (مع rate limiter)
router.post("/login", authLimiter, validateInput, loginUser);

// تسجيل الخروج
router.post("/logout", logoutUser);

// التحقق من صلاحية التوكن
router.get("/verify", verifyToken);

// تجديد access token
router.post("/refresh", refreshAccessToken);

// التحقق من البريد الإلكتروني
router.post("/verify-email", verifyEmail);

// نسيان كلمة المرور
router.post("/forgot-password", forgotPassword);

// إعادة تعيين كلمة المرور
router.post("/reset-password", resetPassword);

// عرض الملف الشخصي (محمي)
router.get("/profile", authenticateToken, getProfile);

// تحديث الملف الشخصي (محمي)
router.put("/profile", authenticateToken, updateProfile);

export default router;

*/

/*

// services/auth/routes/auth.ts
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController";
import { verifyToken } from "../../shared/authMiddleware";
import { checkRole } from "../../shared/roleMiddleware";
import { rateLimiter } from "../../shared/rateLimiter";

/*
// services/auth/routes/auth.ts
import { Router, Request, Response } from "express";
import {
  registerUser,
  :loginUser,
  logoutUser,
  verifyToken,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  validateInput,
  authenticateToken,
} from "../controllers/authController";

*

const router = Router();

// تسجيل مستخدم جديد
router.post("/register", validateInput, registerUser);

// تسجيل الدخول
router.post("/login", validateInput, loginUser);

// تسجيل الخروج
router.post("/logout", logoutUser);

// التحقق من صلاحية التوكن
router.get("/verify", verifyToken);

// تجديد access token باستخدام refresh token
router.post("/refresh", refreshAccessToken);

// التحقق من البريد الإلكتروني
router.post("/verify-email", verifyEmail);

// نسيان كلمة المرور
router.post("/forgot-password", forgotPassword);

// إعادة تعيين كلمة المرور
router.post("/reset-password", resetPassword);

// عرض الملف الشخصي (محمي)
router.get("/profile", authenticateToken, getProfile);

// تحديث الملف الشخصي (محمي)
router.put("/profile", authenticateToken, updateProfile);

export default router;


*/

/*
// services/auth/routes/auth.ts
import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();
import cookieParser from "cookie-parser";
router.use(cookieParser());
const router = Router();

// فحص المتغيرات البيئية الأساسية
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is required in environment variables");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "access_token";

// توليد التوكن وتخزينه في كوكي آمن
const generateToken = (res: Response, userId: string, role: string) => {
  const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // أسبوع
  });
  return token;
};

// middleware للتحقق من التوكن (يمكن استخدامه في مسارات محمية)
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded; // إضافة المستخدم إلى الطلب
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token." });
  }
};

// middleware للتحقق من صحة الإدخال الأساسي (يمكن توسيعه بمكتبات مثل Joi)
const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }
  next();
};

// تسجيل مستخدم جديد
router.post("/register", validateInput, async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role: "user" });

    generateToken(res, newUser._id.toString(), newUser.role);
    res.status(201).json({ message: "User registered successfully", user: { id: newUser._id, email } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// تسجيل الدخول
router.post("/login", validateInput, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    generateToken(res, user._id.toString(), user.role);
    res.json({ message: "Login successful", user: { id: user._id, email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// تسجيل الخروج
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "Logged out successfully" });
});

// التحقق من صلاحية التوكن
router.get("/verify", (req: Request, res: Response) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ valid: false, error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false, error: "Invalid token" });
  }
});

// مثال على مسار محمي (اختياري، يمكن إزالته إذا لم يكن مطلوباً)
router.get("/profile", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

*/

/*

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";

const router = Router();

/**
 * ✅ Registe
 *
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const payload = { id: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Login
 *
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const payload = { id: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Refresh
 *
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token provided" });

    const payload = verifyRefreshToken(token);
    if (!payload) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = generateAccessToken(payload);

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Logout
 *
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
  return res.json({ message: "Logged out successfully" });
});

export default router;

*/
