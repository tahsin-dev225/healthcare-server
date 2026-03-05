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
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import auth from "./app/lib/auth";
import path from "path";
import cors from "cors";
import { envVars } from "./config/env";
import qs from "qs";
import { IndexRoutes } from "./app/routes";

const app: Application = express()
app.set("query parser", (str: string) => qs.parse(str))


app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templets`));

app.use(cors({
  origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api/auth", toNodeHandler(auth))

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', IndexRoutes)

// Basic route
app.get('/', async (req: Request, res: Response) => {

  throw new AppError(status.BAD_REQUEST, "This is a test error from root route.")
  res.send('Hello, World!');
});

app.use(globalErrorHandler)
app.use(notFound)


export default app;