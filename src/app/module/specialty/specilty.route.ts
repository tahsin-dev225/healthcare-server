import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { checkAuth } from "../../midlewere/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post('/',checkAuth(Role.ADMIN, Role.SUPER_ADMIN), specialtyController.createSpecialty);

router.get('/', specialtyController.getSpecialties);

router.delete('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), specialtyController.deleteSpecialty);

export const specialtyRouter = router;