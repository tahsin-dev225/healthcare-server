import { UserStatus } from "../../../generated/prisma/enums";
import auth from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";

interface IRegisterPaitentPayload {
  name : string;
  email : string;
  password : string
}

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

interface ILoginUserPayload {
  email : string;
  password : string
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

export const authService = {
  registerPaitent,
  loginUser
}