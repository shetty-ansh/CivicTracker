import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'maintenance', 'emergency', 'policy', 'event'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: Date,
    targetAudience: {
        type: String,
        enum: ['all', 'citizens', 'authorities'],
        default: 'all'
    }
}, { timestamps: true });

export const Announcement = mongoose.model('Announcement', AnnouncementSchema);
