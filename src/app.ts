import express, { Application, Request, Response } from "express";
import { specialtyRouter } from "./app/module/specialty/specilty.route";
import { authRouter } from "./app/module/auth/auth.route";
import { globalErrorHandler } from "./app/midlewere/globalErrorHandler";
import { notFound } from "./app/midlewere/notFound";
import { userRouter } from "./app/module/user/user.route";
import { doctorRouter } from "./app/module/doctor/doctor.route";
import AppError from "./app/errorHalpers/AppError";
import status from "http-status";
import { adminRouter } from "./app/module/admin/admin.route";

const app : Application = express()

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/specialties", specialtyRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/doctors", doctorRouter)
app.use("/api/v1/admins", adminRouter)

// Basic route
app.get('/', async (req : Request, res : Response) => {

  throw new AppError(status.BAD_REQUEST,"This is a test error from root route.")
  res.send('Hello, World!');
});

app.use(globalErrorHandler)
app.use(notFound)


export default app;