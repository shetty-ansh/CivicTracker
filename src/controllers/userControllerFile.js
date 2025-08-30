import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users-model.js";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
    })
    
    if (existingUser) {
        return res.status(409).json({
            message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
        })
    }

    const user = await User.create({ username, email, password, fullName, role })
    res.status(201).json({
        message: "User Registered Successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }
    })
})

export {registerUser}

