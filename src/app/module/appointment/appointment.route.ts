import { Router } from "express";
import { checkAuth } from "../../midlewere/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { AppointmentController } from "./appointment.controller";



const router = Router();

router.post("/book-appointment",
  checkAuth(Role.PAITENT),
  AppointmentController.bookAppointment);

router.get("/my-appointments",
  checkAuth(Role.PAITENT, Role.DOCTOR),
  AppointmentController.getMyAppointments);

router.patch("/change-appointment-status/:id",
  checkAuth(Role.PAITENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  AppointmentController.changeAppointmentStatus);

router.get("/my-single-appointment/:id",
  checkAuth(Role.PAITENT, Role.DOCTOR),
  AppointmentController.getMySingleAppointment);

router.get("/all-appointments",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AppointmentController.getAllAppointments);

router.post("/book-appointment-with-pay-later",
  checkAuth(Role.PAITENT),
  AppointmentController.bookAppointmentWithPayLater);

router.post("/initiate-payment/:id",
  checkAuth(Role.PAITENT),
  AppointmentController.initiatePayment);

export const appointmentRoute = router; 