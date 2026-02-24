import { Router } from "express";
import { adminController } from "./admin.controller";
import { checkAuth } from "../../midlewere/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get('/all-admins',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminController.getAllAdmins )

router.get('/admin/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminController.getAdminById )

router.put('/admin/:id',
  checkAuth( Role.SUPER_ADMIN),
  adminController.updateAdmin )

router.delete('/admin/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminController.deleteAdmin )


export const adminRouter = router;