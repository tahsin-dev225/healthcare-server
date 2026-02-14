import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const registerPatient = catchAsync(
  async(req : Request, res : Response) => {
    const payload = req.body;

    const result = await authService.registerPaitent(payload);
    sendResponse(res, {
      httpStatusCode : status.CREATED,
      message : "Patient regiterd successfully ",
      data : result,
      success : true
    })
  }
)

const loginUser = catchAsync(
  async(req : Request, res : Response) => {
    const payload = req.body;
    const result = await authService.loginUser(payload);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "User logged in successfully",
      data : result
    })
  }
)

export const authController = {
  registerPatient,
  loginUser
}