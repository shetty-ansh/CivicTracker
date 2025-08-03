import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is Required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password:{
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
        enum: ['citizen', 'admin'],
        default: 'citizen',
    },
    phone: {
        type: String,
        required: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
},{timestamps: true});

usersSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

usersSchema.methods.isPasswrdCorrect = async function(plainPassword){
    return await bcrypt.compare(plainPassword, this.password)
}

usersSchema.methods.newAccessToken = async function () {
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.config.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.config.ACCESS_TOKEN_EXPIRY
    })
}

usersSchema.methods.newRefreshToken = async function () {
    jwt.sign({
        _id: this._id,
    },
    process.env.config.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.config.REFRESH_TOKEN_EXPIRY
    })
}


export const Users = mongoose.model("usersModel", usersSchema);