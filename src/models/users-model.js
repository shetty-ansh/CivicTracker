import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is Required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is Required!"],
        minlength: [8, "Password should be atleast 8 characters long!"]
    },
    email: {
        type: String,
        required: [true, "Email is Required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    role: { 
        type: String, 
        enum: ['citizen', 'authority', 'admin'], 
        default: 'citizen'
    },
    badges: [String]

}, { timestamps: true });

usersSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
});

usersSchema.methods.isPasswordCorrect = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password)
}

usersSchema.methods.newAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        })
}

usersSchema.methods.newRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        })
}

export const User = mongoose.model("User", usersSchema);