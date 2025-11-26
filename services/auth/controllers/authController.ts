// services/auth/controllers/authController.ts
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import multer from "multer";
import cloudinary from "cloudinary";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, clearTokens } from "../../shared/jwt";
import { hashPassword, comparePassword } from "../../shared/hash";
import { config } from "../../shared/config";

// إعداد Cloudinary
cloudinary.v2.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

// إعداد multer للتحميل المؤقت
const upload = multer({ dest: "uploads/" });

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required, including confirm password" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    // إنشاء التوكن الخاص بالتأكيد
    const verificationToken = jwt.sign({ id: user._id, role: user.role, isVerified: false }, config.jwtSecret, { expiresIn: "1d" });
    const verificationLink = `http://localhost:5001/auth/verify-email?token=${verificationToken}`;
    console.log("Verification link:", verificationLink); // في الإنتاج ترسله بالإيميل

    // إنشاء refresh token وتخزينه
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({
      token: refreshTokenValue,
      userId: user._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: { id: user._id, email: user.email, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.error("Login error: User not found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      console.error("Login error: Invalid password for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Account not verified. Please verify your email first." });
    }

    user.lastLogin = new Date();
    await user.save();

    await RefreshToken.deleteMany({ userId: user._id });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    generateAccessToken(res, user._id.toString(), user.role, user.isVerified);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: "Old password, new password, and confirm new password are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "New password and confirm new password do not match" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long." });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      return res.status(400).json({
        error: "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&).",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isOldPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    await RefreshToken.deleteMany({ userId: user._id });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (refresh_token) {
      await RefreshToken.deleteOne({ token: refresh_token });
    }
    clearTokens(res);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyToken = (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ valid: false, error: "No token" });

  const decoded = verifyRefreshToken(token);
  if (!decoded) return res.status(401).json({ valid: false, error: "Invalid token" });

  res.json({ valid: true, user: decoded });
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) return res.status(401).json({ error: "No refresh token" });

    const tokenDoc = await RefreshToken.findOne({ token: refresh_token });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    generateAccessToken(res, user._id.toString(), user.role, user.isVerified);
    res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    // إذا كان هناك ملف صورة، ارفعه إلى Cloudinary
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "user-avatars",
        public_id: `avatar-${userId}`,
        overwrite: true,
      });
      updates.avatar = result.secure_url;
      // حذف الملف المؤقت
      require("fs").unlinkSync(req.file.path);
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("Updated user:", { lastLogin: user.lastLogin, avatar: user.avatar });

    res.json({ user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ error: "Token is required" });

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  res.json({ message: "Forgot password placeholder" });
};

export const resetPassword = async (req: Request, res: Response) => {
  res.json({ message: "Reset password placeholder" });
};




/*


// services/auth/controllers/authController.ts
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, clearTokens } from "../../shared/jwt";
import { hashPassword, comparePassword } from "../../shared/hash";
import { config } from "../../shared/config";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required, including confirm password" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    // إنشاء التوكن الخاص بالتأكيد
    const verificationToken = jwt.sign({ id: user._id, role: user.role, isVerified: false }, config.jwtSecret, { expiresIn: "1d" });
    const verificationLink = `http://localhost:5001/auth/verify-email?token=${verificationToken}`;
    console.log("Verification link:", verificationLink); // في الإنتاج ترسله بالإيميل

    // إنشاء refresh token وتخزينه
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({
      token: refreshTokenValue,
      userId: user._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: { id: user._id, email: user.email, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.error("Login error: User not found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      console.error("Login error: Invalid password for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Account not verified. Please verify your email first." });
    }

    user.lastLogin = new Date();
    await user.save();

    await RefreshToken.deleteMany({ userId: user._id });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    generateAccessToken(res, user._id.toString(), user.role, user.isVerified);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: "Old password, new password, and confirm new password are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "New password and confirm new password do not match" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long." });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      return res.status(400).json({
        error: "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&).",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isOldPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    await RefreshToken.deleteMany({ userId: user._id });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (refresh_token) {
      await RefreshToken.deleteOne({ token: refresh_token });
    }
    clearTokens(res);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyToken = (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ valid: false, error: "No token" });

  const decoded = verifyRefreshToken(token); // استخدم verifyRefreshToken إذا كان access
  if (!decoded) return res.status(401).json({ valid: false, error: "Invalid token" });

  res.json({ valid: true, user: decoded });
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) return res.status(401).json({ error: "No refresh token" });

    const tokenDoc = await RefreshToken.findOne({ token: refresh_token });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    generateAccessToken(res, user._id.toString(), user.role, user.isVerified);
    res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, avatar } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ error: "Token is required" });

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  res.json({ message: "Forgot password placeholder" });
};

export const resetPassword = async (req: Request, res: Response) => {
  res.json({ message: "Reset password placeholder" });
};



*/




/*

// services/auth/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, clearTokens } from "../../shared/jwt";
import { hashPassword, comparePassword } from "../../shared/hash";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required, including confirm password" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    // إنشاء التوكن الخاص بالتأكيد
    const verificationToken = generateAccessToken(res, user._id.toString(), user.role, user.isVerified);
    const verificationLink = `http://localhost:5001/auth/verify-email?token=${verificationToken}`;
    console.log("Verification link:", verificationLink); // في الإنتاج ترسله بالإيميل

    // إنشاء refresh token وتخزينه
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({
      token: refreshTokenValue,
      userId: user._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: { id: user._id, email: user.email, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/

// تسجيل مستخدم جديد
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required, including confirm password" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    generateAccessToken(res, user._id.toString(), user.role, user.isVerified);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



// بعد إنشاء المستخدم
const verificationToken = generateAccessToken(null, user._id.toString(), user.role, false); // أو أي token خاص بالتأكيد
const verificationLink = `http://localhost:5001/auth/verify-email?token=${verificationToken}`;

console.log("Verification link:", verificationLink);


/*



// تسجيل الدخول
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.error("Login error: User not found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      console.error("Login error: Invalid password for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ error: "Account not verified. Please verify your email first." });
    }
    user.lastLogin = new Date();
    await user.save();

    await RefreshToken.deleteMany({ userId: user._id });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    generateAccessToken(res, user._id.toString(), user.role, user.isVerified);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تغيير كلمة المرور (محمي، يتحقق من الكلمة القديمة)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: "Old password, new password, and confirm new password are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "New password and confirm new password do not match" });
    }

    // التحقق من شروط الكلمة الجديدة
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long." });
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      return res.status(400).json({
        error: "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&).",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // التحقق من الكلمة القديمة
    const isOldPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    // تحديث الكلمة الجديدة (سيتم تشفيرها تلقائياً في pre-save)
    user.password = newPassword;
    await user.save();

    // إبطال refresh tokens القديمة للأمان
    await RefreshToken.deleteMany({ userId: user._id });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الخروج
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (refresh_token) {
      await RefreshToken.deleteOne({ token: refresh_token });
    }
    clearTokens(res);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// التحقق من صلاحية التوكن
export const verifyToken = (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ valid: false, error: "No token" });

  const decoded = verifyAccessToken(token);
  if (!decoded) return res.status(401).json({ valid: false, error: "Invalid token" });

  res.json({ valid: true, user: decoded });
};

// تجديد access token
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) return res.status(401).json({ error: "No refresh token" });

    const tokenDoc = await RefreshToken.findOne({ token: refresh_token });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    generateAccessToken(res, user._id.toString(), user.role, user.isVerified);
    res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// getProfile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// updateProfile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, avatar } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// placeholders

// ✅ التحقق من البريد الإلكتروني
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ error: "Token is required" });

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};




export const forgotPassword = async (req: Request, res: Response) => {
  res.json({ message: "Forgot password placeholder" });
};

export const resetPassword = async (req: Request, res: Response) => {
  res.json({ message: "Reset password placeholder" });
};


*/

/*

// services/auth/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, clearTokens } from "../../shared/jwt";
import { hashPassword, comparePassword } from "../../shared/hash";

// تسجيل مستخدم جديد
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required, including confirm password" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password do not match" });
    }
   const passwordRegex =
     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
   if (!passwordRegex.test(password)) {
    return res.status(400).json({
    error:
      "Password must contain at least one lowercase, one uppercase, one number, and one special character (@$!%*?&)",
  });
}
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    generateAccessToken(res, user._id.toString(), user.role);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الدخول
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.error("Login error: User not found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      console.error("Login error: Invalid password for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    await RefreshToken.deleteMany({ userId: user._id });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    generateAccessToken(res, user._id.toString(), user.role);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الخروج
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (refresh_token) {
      await RefreshToken.deleteOne({ token: refresh_token });
    }
    clearTokens(res);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// التحقق من صلاحية التوكن
export const verifyToken = (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ valid: false, error: "No token" });

  const decoded = verifyAccessToken(token);
  if (!decoded) return res.status(401).json({ valid: false, error: "Invalid token" });

  res.json({ valid: true, user: decoded });
};

// تجديد access token
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) return res.status(401).json({ error: "No refresh token" });

    const tokenDoc = await RefreshToken.findOne({ token: refresh_token });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    generateAccessToken(res, user._id.toString(), user.role);
    res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// getProfile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// updateProfile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, avatar } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// placeholders
export const verifyEmail = async (req: Request, res: Response) => {
  res.json({ message: "Email verification placeholder" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  res.json({ message: "Forgot password placeholder" });
};

export const resetPassword = async (req: Request, res: Response) => {
  res.json({ message: "Reset password placeholder" });
};

*/

/*

// services/auth/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { generateAccessToken, generateRefreshToken, clearTokens } from "../../shared/jwt";
import { hashPassword, comparePassword } from "../../shared/hash";

// تسجيل مستخدم جديد
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required, including confirm password" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    generateAccessToken(res, user._id.toString(), user.role);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الدخول
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.error("Login error: User not found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      console.error("Login error: Invalid password for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    // إبطال refresh tokens القديمة
    try {
      await RefreshToken.deleteMany({ userId: user._id });
    } catch (deleteErr) {
      console.error("Login error: Failed to delete old refresh tokens:", deleteErr);
    }

    const refreshTokenValue = generateRefreshToken(user._id.toString());
    try {
      await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    } catch (createErr) {
      console.error("Login error: Failed to create refresh token:", createErr);
      return res.status(500).json({ error: "Internal server error" });
    }

    generateAccessToken(res, user._id.toString(), user.role);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// باقي الcontrollers كما هو...


*/


/*


// services/auth/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { generateAccessToken, generateRefreshToken, clearTokens } from "../../shared/jwt";
import { hashPassword, comparePassword } from "../../shared/hash";

// تسجيل مستخدم جديد
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required, including confirm password" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    generateAccessToken(res, user._id.toString(), user.role);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الدخول
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();

    await RefreshToken.deleteMany({ userId: user._id });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    generateAccessToken(res, user._id.toString(), user.role);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الخروج
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (refresh_token) {
      await RefreshToken.deleteOne({ token: refresh_token });
    }
    clearTokens(res);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// التحقق من صلاحية التوكن
export const verifyToken = (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ valid: false, error: "No token" });

  const decoded = verifyAccessToken(token);
  if (!decoded) return res.status(401).json({ valid: false, error: "Invalid token" });

  res.json({ valid: true, user: decoded });
};

// تجديد access token
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) return res.status(401).json({ error: "No refresh token" });

    const tokenDoc = await RefreshToken.findOne({ token: refresh_token });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    generateAccessToken(res, user._id.toString(), user.role);
    res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// getProfile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// updateProfile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, avatar } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// placeholders
export const verifyEmail = async (req: Request, res: Response) => {
  res.json({ message: "Email verification placeholder" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  res.json({ message: "Forgot password placeholder" });
};

export const resetPassword = async (req: Request, res: Response) => {
  res.json({ message: "Reset password placeholder" });
};

*/

/*

// services/auth/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, clearTokens } from "../../shared/jwt";
import { hashPassword, comparePassword } from "../../shared/hash";

// تسجيل مستخدم جديد
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required, including confirm password" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    generateRefreshToken(res, user._id.toString()); // تخزين في cookie
    generateAccessToken(res, user._id.toString(), user.role);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الدخول
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();

    generateRefreshToken(res, user._id.toString()); // تخزين في cookie
    generateAccessToken(res, user._id.toString(), user.role);

    res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الخروج
export const logoutUser = (req: Request, res: Response) => {
  clearTokens(res);
  res.json({ message: "Logged out successfully" });
};

// التحقق من صلاحية التوكن
export const verifyToken = (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ valid: false, error: "No token" });

  const decoded = verifyAccessToken(token);
  if (!decoded) return res.status(401).json({ valid: false, error: "Invalid token" });

  res.json({ valid: true, user: decoded });
};

// تجديد access token باستخدام refresh token من cookie
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) return res.status(403).json({ error: "Invalid or expired refresh token" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    generateAccessToken(res, user._id.toString(), user.role);
    res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// getProfile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// updateProfile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, avatar } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// placeholders
export const verifyEmail = async (req: Request, res: Response) => {
  res.json({ message: "Email verification placeholder" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  res.json({ message: "Forgot password placeholder" });
};

export const resetPassword = async (req: Request, res: Response) => {
  res.json({ message: "Reset password placeholder" });
};

*/

/*



// services/auth/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { generateAccessToken, generateRefreshToken, clearTokens } from "../../shared/jwt";
import { hashPassword, comparePassword } from "../../shared/hash";

// تسجيل مستخدم جديد (مع فحص confirmPassword)
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required, including confirm password" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password do not match" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const user = await User.create({ name, email, password });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    generateAccessToken(res, user._id.toString(), user.role);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الدخول
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();

    await RefreshToken.deleteMany({ userId: user._id });
    const refreshTokenValue = generateRefreshToken(user._id.toString());
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    generateAccessToken(res, user._id.toString(), user.role);
    res.cookie("refresh_token", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الخروج
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (refresh_token) {
      await RefreshToken.deleteOne({ token: refresh_token });
    }
    clearTokens(res);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// التحقق من صلاحية التوكن
export const verifyToken = (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ valid: false, error: "No token" });

  const decoded = verifyAccessToken(token);
  if (!decoded) return res.status(401).json({ valid: false, error: "Invalid token" });

  res.json({ valid: true, user: decoded });
};

// تجديد access token
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) return res.status(401).json({ error: "No refresh token" });

    const tokenDoc = await RefreshToken.findOne({ token: refresh_token });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    generateAccessToken(res, user._id.toString(), user.role);
    res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// getProfile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// updateProfile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, avatar } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// placeholders
export const verifyEmail = async (req: Request, res: Response) => {
  res.json({ message: "Email verification placeholder" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  res.json({ message: "Forgot password placeholder" });
};

export const resetPassword = async (req: Request, res: Response) => {
  res.json({ message: "Reset password placeholder" });
};

*/
/*

import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// فحص المتغيرات البيئية
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is required in environment variables");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "access_token";

// توليد access token
const generateToken = (res: Response, userId: string, role: string) => {
  const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};

// توليد refresh token وتخزينه في DB
const generateRefreshToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 يوماً
  await RefreshToken.create({ token, userId, expiresAt });
  return token;
};

// حذف refresh tokens للمستخدم
const revokeRefreshTokens = async (userId: string) => {
  await RefreshToken.deleteMany({ userId });
};

// middlewares
const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password && password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
  }
  if (password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)" });
  }
  next();
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token." });
  }
};

// تسجيل مستخدم جديد
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const refreshToken = await generateRefreshToken(user._id.toString());

    generateToken(res, user._id.toString(), user.role);
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الدخول
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();

    await revokeRefreshTokens(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    generateToken(res, user._id.toString(), user.role);
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// تسجيل الخروج
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (refresh_token) {
      await RefreshToken.deleteOne({ token: refresh_token });
    }
    res.clearCookie(COOKIE_NAME);
    res.clearCookie("refresh_token");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// التحقق من صلاحية التوكن
export const verifyToken = (req: Request, res: Response) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ valid: false, error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false, error: "Invalid token" });
  }
};

// تجديد access token
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) return res.status(401).json({ error: "No refresh token" });

    const tokenDoc = await RefreshToken.findOne({ token: refresh_token });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    generateToken(res, user._id.toString(), user.role);
    res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// التحقق من البريد الإلكتروني (placeholder)
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const user = await User.findOneAndUpdate(
      { /* منطق البحث بالتوكن * },
      { isVerified: true },
      { new: true }
    );
    if (!user) return res.status(400).json({ error: "Invalid verification token" });
    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// نسيان كلمة المرور (placeholder)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// إعادة تعيين كلمة المرور (placeholder)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Token and new password are required" });
    const user = await User.findOneAndUpdate(
      { /* منطق البحث بالتوكن * },
      { password: newPassword },
      { new: true }
    );
    if (!user) return res.status(400).json({ error: "Invalid reset token" });
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// عرض الملف الشخصي
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console
*/
