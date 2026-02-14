import { Router } from "express";
import { specialtyController } from "./specialty.controller";

const router = Router();

router.post('/', specialtyController.createSpecialty);

router.get('/', specialtyController.getSpecialties);

router.delete('/:id', specialtyController.deleteSpecialty);

export const specialtyRouter = router;