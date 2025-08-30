import mongoose from "mongoose"

// const CommentSchema = new mongoose.Schema({
//     user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
//     text: String,
//     createdAt: {type:Date, default:Date.now}
// });

const ComplaintSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: { type: String, enum: ['corruption', 'sanitation', 'roadwork', 'electricity', 'water supply', 'noise', 'traffic', 'public safety', 'health services', 'others'] },
    images: [String],
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' }
    },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    anonymous: { type: Boolean, default: false },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    assignedTo: String
}, { timestamps: true })

export const Complaints = mongoose.model('Complaint', ComplaintSchema)