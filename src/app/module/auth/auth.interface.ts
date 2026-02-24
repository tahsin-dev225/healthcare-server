export interface ILoginUserPayload {
  email : string;
  password : string
}

export interface IRegisterPaitentPayload {
  name : string;
  email : string;
  password : string
}

export interface iChangePassword {
  currentPassword : string;
  newPassword : string
}