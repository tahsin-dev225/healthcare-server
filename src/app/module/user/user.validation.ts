import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
  password : z.string("Password is requred").min(4,"password must be atleast 4 characters"),
  doctor : z.object({
    name : z.string("Name is requred").min(5,"name must be atleast 5 character"),
    email : z.email("Valid email is requred"),
    contactNumber : z.string("Contact number is requred").min(11,"Contact number must be atleast 11 characters"),
    address : z.string("Address is requred").min(5,"Address must be atleast 5 characters").optional(),
    registrationNumber : z.string("Registration number is requred").min(3,"Registration number must be atleast 3 characters"),
    experience : z.number("Experience is requred").min(0,"Experience must be atleast 0 years").optional(),
    gender : z.enum([Gender.FEMALE,Gender.MALE], "Gender must be either Male or Female"),
    appointmentFee : z.number("Appointment fee is requred").nonnegative("Appointment fee must be a non-negative number"),
    qualification : z.string("Qualification is requred").min(3,"Qualification must be atleast 3 characters"),
    specialties : z.array(z.uuid("Specialty ID must be a string").min(1,"Specialty ID must be atleast 1 character")),
  }),
})
