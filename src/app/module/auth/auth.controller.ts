import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

const registerPatient = catchAsync(
  async(req : Request, res : Response) => {
    const payload = req.body;

    const result = await authService.registerPaitent(payload);
    const { accessToken, refreshToken,token, ...rest } = result;

    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);
    sendResponse(res, {
      httpStatusCode : status.CREATED,
      message : "Patient regiterd successfully ",
      data : {
        token,
        accessToken,
        refreshToken,
        ...rest
      },
      success : true
    })
  }
)

const loginUser = catchAsync(
  async(req : Request, res : Response) => {
    const payload = req.body;
    const result = await authService.loginUser(payload);
    const {accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);

    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "User logged in successfully",
      data : {
        token,
        accessToken,
        refreshToken,
        ...rest
      }
    })
  }
)

export const authController = {
  registerPatient,
  loginUser
}