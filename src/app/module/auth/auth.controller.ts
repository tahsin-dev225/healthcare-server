import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHalpers/AppError";
import { cookieUtils } from "../../utils/cookie";
import { envVars } from "../../../config/env";
import auth from "../../lib/auth";

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

const getMe = catchAsync(
  async(req : Request, res : Response) => {
    const userId = req.user.userId;
    console.log('user id from auth get me',userId);
    const result = await authService.getMe(userId);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "User fetched successfully",
      data : result
    })
  }
)

const getNewToken =catchAsync(
  async(req : Request, res : Response) => {
    const refreshToken = req.cookies.refreshToken;

    const betterAuthSessionToken = req.cookies["better-auth.session_token"];

    if(!refreshToken){
      throw new AppError(status.BAD_REQUEST, "Refresh token is required");
    }

    const result = await authService.getNewToken(refreshToken, betterAuthSessionToken);
    const { accessToken, refreshToken : newRefreshToken, sessionToken, ...rest } = result;

    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken as string);

    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "New access token generated successfully",
      data : {
        accessToken,
        refreshToken : newRefreshToken,
        sessionToken,
        ...rest
      }
    })
  }
)

const changePassword = catchAsync(
  async(req : Request, res : Response) => {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];

    const result = await authService.changePassword(payload, betterAuthSessionToken);

    const { accessToken, refreshToken, token } = result;

    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);

    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Password changed successfully",
      data : result
    })
  }
)

const logOutUser = catchAsync(
  async(req : Request, res : Response) => {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await authService.logOutUser(betterAuthSessionToken);

    // Clear cookies
    cookieUtils.clearCookie(res, "accessToken", {
      httpOnly : true,
      secure : true,
      sameSite : "none"
    });
    cookieUtils.clearCookie(res, "refreshToken", {
      httpOnly : true,
      secure : true,
      sameSite : "none"
    });
    cookieUtils.clearCookie(res, "better-auth.session_token", {
      httpOnly : true,
      secure : true,
      sameSite : "none"
    });

    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "User logged out successfully",
      data : result
    })
  }
)

const verifyEmail = catchAsync(
  async(req : Request, res : Response) => {
    const { otp, email } = req.body;
    await authService.verifyEmail( email, otp);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Email verified successfully"
    })
  }
)

const forgetPassword = catchAsync(
  async(req : Request, res : Response) => {
    const { email } = req.body;
    await authService.forgetPassword(email);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Password reset OTP sent to email if it exists"
    })
  }
)

const resetPassword = catchAsync(
  async(req : Request, res : Response) => {
    const { email, otp, newPassword } = req.body;
    await authService.resetPassword(email, otp, newPassword);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Password reset successfully"
    })
  }
)

const googleLogin = catchAsync((req : Request, res : Response) => {
  const redirectPath = req.query.redirect || "/dashboard";

  const encodedRedirectPath = encodeURIComponent(redirectPath as string);

  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/auth/google/sucess?redirect=${encodedRedirectPath}`;

  res.render("googleRedirect", {
    callbackURL,
    betterAuthUrl : envVars.BETTER_AUTH_URL
  })
})

const googleLoginSuccess = catchAsync(async (req : Request, res : Response) => {
  const redirectPath = req.query.redirect as string || "/dashboard";

  const sessionToken = req.cookies["better-auth.session_token"];

  if(!sessionToken){
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=Oauth_failed`)
  }

  const session = await auth.api.getSession({
    headers : {
      "Cookie" : `better-auth.session_token=${sessionToken}`
    }
  });

  if(!session){
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`)
  }

  if(session && !session.user){
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`)
  }

  const result = await authService.googleLoginSuccess(session);

  const { accessToken, refreshToken } = result;

  tokenUtils.setAccessToken(res, accessToken);
  tokenUtils.setRefreshToken(res, refreshToken);

  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

  res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
})

const handleOAuthError = catchAsync((req : Request, res : Response) => {
  const error = req.query.error as string || "oauth_failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`)
})

export const authController = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logOutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError
}