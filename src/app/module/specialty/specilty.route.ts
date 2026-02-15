import { NextFunction, Request, Response, Router } from "express";
import { specialtyController } from "./specialty.controller";
import { cookieUtils } from "../../utils/cookie";
import AppError from "../../errorHalpers/AppError";
import status from "http-status";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";

const router = Router();

router.post('/', specialtyController.createSpecialty);

router.get('/',async (req : Request, res : Response, next : NextFunction) => {
  try {
    const accessToken = cookieUtils.getCookie(req, "accessToken");

    if(!accessToken){
      throw new AppError(status.UNAUTHORIZED, "Access token is missing");
    }

    const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

    if(!verifiedToken){
      throw new AppError(status.UNAUTHORIZED, "Invalid access token");
    }

    if(verifiedToken.data!.role !== "ADMIN"){
      throw new AppError(status.FORBIDDEN, "You do not have permission to access this resource");
    }

    next();
  } catch (error) {
    next(error);
  }
},  
   specialtyController.getSpecialties);

router.delete('/:id', specialtyController.deleteSpecialty);

export const specialtyRouter = router;