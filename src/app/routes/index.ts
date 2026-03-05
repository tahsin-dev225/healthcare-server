import { Router } from "express";
import { authRouter } from "../module/auth/auth.route";
import { specialtyRouter } from "../module/specialty/specilty.route";
import { userRouter } from "../module/user/user.route";
import { doctorRouter } from "../module/doctor/doctor.route";
import { adminRouter } from "../module/admin/admin.route";
import { scheduleRouter } from "../module/schedule/schedule.route";
import { DoctorScheduleRouter } from "../module/doctorSchedule/doctorSchedule.route";
const router = Router();
// app.use("/api/v1/auth", authRouter)
// app.use("/api/v1/specialties", specialtyRouter)
// app.use("/api/v1/users", userRouter)
// app.use("/api/v1/doctors", doctorRouter)
// app.use("/api/v1/admins", adminRouter)

router.use("/auth", authRouter)
router.use("/specialties", specialtyRouter)
router.use("/users", userRouter)
router.use("/doctors", doctorRouter)
router.use("/admins", adminRouter)
router.use("/schedules", scheduleRouter)
router.use("/doctor-schedules", DoctorScheduleRouter)
// router.use("/appointments", AppointmentRoutes)


export const IndexRoutes = router;