import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"

dotenv.config()

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    credentials: true
}));

// Body parsing middleware - order matters
app.use(express.json({limit: "25kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

//importing routes
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import complaintRoutes from "./routes/complaintRoutes.js";

app.use("/api/users", userRouter)
app.use("/api/auth", authRouter)
app.use("/api/complaints", complaintRoutes)

export {app}
