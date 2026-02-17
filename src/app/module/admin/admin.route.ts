import { Router } from "express";
import { adminController } from "./admin.controller";

const router = Router();

router.get('/all-admins', adminController.getAllAdmins )

router.get('/admin/:id', adminController.getAdminById )

router.put('/admin/:id', adminController.updateAdmin )

router.delete('/admin/:id', adminController.deleteAdmin )


export const adminRouter = router;