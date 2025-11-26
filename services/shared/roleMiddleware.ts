// services/shared/roleMiddleware.ts
import { Request, Response, NextFunction } from "express";

// middleware للتحقق من الدور
export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== requiredRole) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
