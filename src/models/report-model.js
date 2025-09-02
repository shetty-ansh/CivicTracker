import mongoose from "mongoose";
import { Users } from "./users-model.js";
import { Comments } from "./comments-model.js";

const reportsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    category: {
        type: String,
        enum: ['pothole', 'garbage', 'streetlight', 'water leakage', 'others'],
        required: true
    },
    imageUrls: {
        type: [String],
        default: []
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usersModel",
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usersModel"
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    votes: {
        type: Number,
        default: 0
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommentsModel"
    }]
}, { timestamps: true });

export const Reports = mongoose.model("ReportsModel", reportsSchema);
