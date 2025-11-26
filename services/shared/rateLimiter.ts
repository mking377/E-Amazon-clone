// services/shared/rateLimiter.ts
import rateLimit from "express-rate-limit";

// rate limiter عام
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// rate limiter للمسارات الحساسة
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many login attempts, please try again later.",
});
