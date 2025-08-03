import express, { Router } from "express";
import { registerUser } from "../controllers/userControllerFile.js";


const userRouter = Router();

userRouter.route("/register").post(registerUser)

export default userRouter
