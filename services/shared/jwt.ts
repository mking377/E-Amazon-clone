// services/shared/jwt.ts
import jwt from "jsonwebtoken";
import { Response } from "express";
import { config } from "./config";

const ACCESS_COOKIE_NAME = "access_token";
const REFRESH_COOKIE_NAME = "refresh_token";

export const generateAccessToken = (
  res: Response,
  userId: string,
  role: string,
  isVerified: boolean = false
) => {
  try {
    // توكن بصلاحية 7 أيام
    const token = jwt.sign({ id: userId, role, isVerified }, config.jwtSecret, { expiresIn: "7d" });

    res.cookie(ACCESS_COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام بالميلي ثانية
    });

    return token;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("Failed to generate access token");
  }
};
/*
// توليد access token وتخزينه في cookie
export const generateAccessToken = (res: Response, userId: string, role: string) => {
  const token = jwt.sign({ id: userId, role }, config.jwtSecret, { expiresIn: "7d" });
  res.cookie(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};
*/

// توليد refresh token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: "30d" });
};

// التحقق من access token
export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwtSecret) as any;
  } catch {
    return null;
  }
};

// مسح cookies
export const clearTokens = (res: Response) => {
  res.clearCookie(ACCESS_COOKIE_NAME);
  res.clearCookie(REFRESH_COOKIE_NAME);
};
