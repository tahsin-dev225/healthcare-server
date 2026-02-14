import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post('/register', authController.registerPatient);
router.post('/login', authController.loginUser);

// router.get('/', );

// router.delete('/:id', );

export const authRouter = router;