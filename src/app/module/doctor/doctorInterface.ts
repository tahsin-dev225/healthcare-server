import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateDoctorSpecialtyPayload {
    specialtyId: string;
    shouldDelete?: boolean;
}

export interface IDoctorUpdatePayload {
  doctor : {
    id? : string;
    name? : string;
    email? : string;
    phone? : string;
    specialtyId? : string;
    experience? : number;
    gender? : Gender;
    appointmentFee? : number;
    qualification? : string;
    currentWorkingPlace? : string;
    designation? : string;
    address? : string;
    profilePhoto? : string;
    contractNumber? : string;
    registrationNumber? : string;
  },
  specialties?: IUpdateDoctorSpecialtyPayload[];
}