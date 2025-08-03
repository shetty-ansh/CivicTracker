import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
// import { dbName } from "../constants.js";
import { dbName } from "../constants.js";


dotenv.config()

const app = express()

const connectDB = async () => {
    try {
        const dbConnected = await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`)
        console.log(`\n Connected to MongoDB Successfully @ ${mongoose.connection.host}`)
    } catch (error) {
        console.error("MongoDB connection FAILED:" , error)
    }
}

export default connectDB