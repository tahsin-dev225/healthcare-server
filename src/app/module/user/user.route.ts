import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../midlewere/validateRequest";
import { createDoctorZodSchema } from "./user.validation";

const router = Router();




router.post('/create-doctor',
  validateRequest(createDoctorZodSchema),
  userController.createDoctor
);

// router.get('/',  );

// router.delete('/:id',  );

export const userRouter = router;