// services/auth/routes/superAdminRoutes.ts
import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../../shared/authMiddleware";

const router = Router();

// مثال على مسار محمي للـ superadmin فقط
router.get("/dashboard", authenticateToken, authorizeRoles("superadmin"), (req, res) => {
  res.json({ message: "Superadmin dashboard", user: (req as any).user });
});

// يمكن إضافة مسارات أخرى هنا (مثل إدارة المستخدمين)
router.get("/users", authenticateToken, authorizeRoles("superadmin"), async (req, res) => {
  // منطق جلب المستخدمين
  res.json({ message: "List of users" });
});

export default router;
