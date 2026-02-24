/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHalpers/AppError";
import auth from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { iChangePassword, ILoginUserPayload, IRegisterPaitentPayload } from "./auth.interface";


const registerPaitent = async (payload : IRegisterPaitentPayload) => {
  const {name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body : {
      name ,
      email,
      password
    }
  })

  if(!data.user){
    throw new Error("Feiled to register paithent")
  }

  try {
    const patient = await prisma.$transaction( async ( tx ) => {
      const patientTx = await tx.patient.create({
        data : {
          userId : data.user.id,
          name :payload.name,
          email : payload.email,
        }
      })
      return patientTx
    })

  const accessToken = tokenUtils.getAccessToken({
    userId : data.user.id,
    email : data.user.email,
    role : data.user.role ,
    name : data.user.name,
    status : data.user.status,
    isDeleted : data.user.isDeleted,
    emailVerified : data.user.emailVerified
  })

  const refreshToken = tokenUtils.getRefreshToken({
    userId : data.user.id,
    email : data.user.email,
    role : data.user.role ,
    name : data.user.name,
    status : data.user.status,
    isDeleted : data.user.isDeleted,
    emailVerified : data.user.emailVerified
  })

    return {
      ...data,
      token : data.token,
      accessToken,
      refreshToken,
      patient
    } ;
  } catch (error) {
    console.log("Transaction error : ", error);
    await prisma.user.delete({
      where : {
        id : data.user.id
      }
    })
    throw error;
  }

}


const loginUser = async(payload : ILoginUserPayload) => {
  const {email, password } = payload;
  const data = await auth.api.signInEmail({
    body : {
      email,
      password
    }
  })

  if(data.user.status === UserStatus.BLOCKED){
    throw new Error("User is blocked.")
  }

  if(data.user.isDeleted || data.user.status === UserStatus.DELETED){
    throw new Error("User is deleted.")
  }

  const accessToken = tokenUtils.getAccessToken({
    userId : data.user.id,
    email : data.user.email,
    role : data.user.role ,
    name : data.user.name,
    status : data.user.status,
    isDeleted : data.user.isDeleted,
    emailVerified : data.user.emailVerified
  })

  const refreshToken = tokenUtils.getRefreshToken({
    userId : data.user.id,
    email : data.user.email,
    role : data.user.role ,
    name : data.user.name,
    status : data.user.status,
    isDeleted : data.user.isDeleted,
    emailVerified : data.user.emailVerified
  })

  return {
    ...data,
    accessToken,
    refreshToken
  }
}

const getMe = async ( userId : string ) => {
    const isUserExist = await prisma.user.findUnique({
        where : {
            id : userId
        },
        include : {
          patiant : {
            include :{
              appointments : true,
              medicalReports : true,
              reviews : true,
              patientHealthData : true,
              prescriptions : true
            }
          },
          doctor : {
            include : {
              appointments : true,
              reviews : true,
              specialties : true,
              prescriptions : true
            } 
         },
          admin : true
        }
    })

    if(!isUserExist){
        throw new AppError(status.NOT_FOUND,"User not found");
     }

     return isUserExist;
  }

const getNewToken = async( refreshToken : string, sessionToken : string) => {

  const isSessionTokenExist = await prisma.session.findUnique({
    where : {
      token : sessionToken
    },
    include : {
      user : true
    }
  })

  if(!isSessionTokenExist){
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)

  if(!verifiedRefreshToken.success && verifiedRefreshToken.error ){
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    userId : data.userId,
    email : data.email,
    role : data.role ,
    name : data.name,
    status : data.status,
    isDeleted : data.isDeleted,
    emailVerified : data.emailVerified
  })

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId : data.userId,
    email : data.email,
    role : data.role ,
    name : data.name,
    status : data.status,
    isDeleted : data.isDeleted,
    emailVerified : data.emailVerified
  })

  const {token } = await prisma.session.update({
    where : {
      token : sessionToken
    },
    data : {
      token : sessionToken,
      expiresAt : new Date(Date.now() + 60 * 60 * 60 * 24 * 1000), // 1 day 
      updatedAt : new Date()
    }
  })

  return {
    accessToken : newAccessToken,
    refreshToken : newRefreshToken,
    sessionToken : token
  }
}


const changePassword = async ( payload : iChangePassword, sessionToken : string) => {
  
  const session = await auth.api.getSession({
    headers : new Headers({
      Authorization : `Bearer ${sessionToken}`
    })
  })

  if(!session){
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const { currentPassword, newPassword } = payload;

  const result = await  auth.api.changePassword({
    body : {
      currentPassword,
      newPassword,
      revokeOtherSessions : true
    },
    headers : new Headers({
      Authorization : `Bearer ${sessionToken}`
    })
  })

  if(session.user.needPasswordChange){
    await prisma.user.update({
      where : {
        id : session.user.id
      },
      data : {
        needPasswordChange : false
      }
    })
  }

  const accessToken = tokenUtils.getAccessToken({
    userId : session.user.id,
    email : session.user.email,
    role : session.user.role ,
    name : session.user.name,
    status : session.user.status,
    isDeleted : session.user.isDeleted,
    emailVerified : session.user.emailVerified
  })

  const refreshToken = tokenUtils.getRefreshToken({
    userId : session.user.id,
    email : session.user.email,
    role : session.user.role ,
    name : session.user.name,
    status : session.user.status,
    isDeleted : session.user.isDeleted,
    emailVerified : session.user.emailVerified
  })

  return {
    ...result,
    accessToken,
    refreshToken
  }
}

const logOutUser = async ( sessionToken : string) => {
  const result = await auth.api.signOut({
    headers : new Headers({
      Authorization : `Bearer ${sessionToken}`
    })
  })

  return result;
}

const verifyEmail = async ( email : string, otp : string) => {
  const result = await auth.api.verifyEmailOTP({
    body : {
      email,
      otp
    }
  })

  if(result.status && !result.user.emailVerified){
    await prisma.user.update({
      where : {
        email
      },
      data : {
        emailVerified : true
       }
    })
  }
}

const forgetPassword = async ( email : string ) => {

  const isUserExist = await prisma.user.findUnique({
    where : {
      email
    }
  })

  if(!isUserExist){
    throw new AppError(status.NOT_FOUND, "User not found with this email");
  }

  if(!isUserExist.emailVerified){
    throw new AppError(status.BAD_REQUEST, "Email is not verified");
  }

  if(isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED){
    throw new AppError(status.BAD_REQUEST, "User account is deleted");
  }

  await auth.api.requestPasswordResetEmailOTP({
    body : {
      email
    }
  })

}

const resetPassword = async ( email : string, otp : string, newPassword : string) => {
  
  const isUserExist = await prisma.user.findUnique({
    where : {
      email
    }
  })

  if(!isUserExist){
    throw new AppError(status.NOT_FOUND, "User not found with this email");
  }

  if(!isUserExist.emailVerified){
    throw new AppError(status.BAD_REQUEST, "Email is not verified");
  }

  if(isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED){
    throw new AppError(status.BAD_REQUEST, "User account is deleted");
  }

  await auth.api.resetPasswordEmailOTP({
    body : {
      email,
      otp,
      password : newPassword
    }
  })

  if(isUserExist.needPasswordChange){
    await prisma.user.update({
      where : {
        id : isUserExist.id
      },
      data : {
        needPasswordChange : false
      }
    })
  }

  await prisma.session.deleteMany({
    where : {
      userId : isUserExist.id
    }
  })

}

const googleLoginSuccess = async (session : Record<string, any>) => {
  const isPatientExist = await prisma.patient.findUnique({
    where : {
      userId : session.user.id
    }
  })

  if(!isPatientExist){
    await prisma.patient.create({
      data : {
        userId : session.user.id,
        name : session.user.name,
        email : session.user.email
      }
    })
  }

  const accessToken = tokenUtils.getAccessToken({
    userId : session.user.id,
    role : session.user.role,
    name : session.user.name,
  })

  const refreshToken = tokenUtils.getRefreshToken({
    userId : session.user.id,
    role : session.user.role,
    name : session.user.name,
  })

  return {
    accessToken,
    refreshToken
  }
}


export const authService = {
  registerPaitent,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logOutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess
}