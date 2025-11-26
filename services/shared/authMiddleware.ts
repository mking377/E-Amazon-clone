// services/shared/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./jwt";

// التحقق من صحة التوكن وإضافة بيانات المستخدم (مع حماية التفعيل)
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }

  // حماية الحساب غير المفعل
  if (!decoded.isVerified) {
    return res.status(403).json({ error: "Account not verified. Please verify your email first." });
  }

  (req as any).user = decoded;
  next();
};

// middleware إضافي للتحقق من التفعيل (اختياري، للمسارات التي تحتاج حماية إضافية)
export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || !user.isVerified) {
    return res.status(403).json({ error: "Account not verified. Please verify your email first." });
  }
  next();
};

// validation للregister
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required, including confirm password." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    return res.status(400).json({
      error: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&).",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Password and confirm password do not match." });
  }

  next();
};

// validation للlogin
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  next();
};

// التحقق من الدور
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated." });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Access denied: insufficient privileges." });
    }
    next();
  };
};


/*
// services/shared/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./jwt";

// التحقق من صحة التوكن
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }

  (req as any).user = decoded;
  next();
};

// validation للregister (يتطلب name, email, password, confirmPassword)
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required, including confirm password." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    return res.status(400).json({
      error: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&).",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Password and confirm password do not match." });
  }

  next();
};

// validation للlogin (يتطلب email, password فقط)
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  next();
};

// التحقق من الدور
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated." });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Access denied: insufficient privileges." });
    }
    next();
  };
};

*/

/*


// services/shared/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./jwt";

// التحقق من صحة التوكن وإضافة بيانات المستخدم للطلب
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }

  (req as any).user = decoded;
  next();
};

// التحقق من صحة الإدخال (email, password, confirmPassword)
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, confirmPassword } = req.body;

  // فحص الحقول الأساسية
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  // فحص تنسيق البريد الإلكتروني
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  // فحص طول كلمة المرور
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  // فحص تعقيد كلمة المرور
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    return res.status(400).json({
      error: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&).",
    });
  }

  // فحص تطابق كلمة المرور وتأكيدها
  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: "Password and confirm password do not match." });
  }

  next();
};

// التحقق من صلاحيات الدور (يدعم أدوار متعددة)
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated." });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Access denied: insufficient privileges." });
    }
    next();
  };
};

*/

/*

// services/shared/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./jwt";

// middleware للتحقق من التوكن
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  const decoded = verifyAccessToken(token);
  if (!decoded) return res.status(403).json({ error: "Invalid token." });

  (req as any).user = decoded;
  next();
};

// middleware للتحقق من صحة الإدخال

export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, confirmPassword } = req.body;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password && password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
  }
  if (password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)" });
  }
  if (password && confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: "Password and confirm password do not match" });
  }
  next();
};

*/
