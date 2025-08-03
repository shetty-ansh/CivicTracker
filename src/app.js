import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
// import dotenv from "dotenv"

// dotenv.config()

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "25kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

//importing routes

import userRouter from "./routes/userRouter.js";

app.use("/users", userRouter)

export {app}
