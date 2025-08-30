import jwt from 'jsonwebtoken'
import { User } from '../models/users-model.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const signup = asyncHandler(async (req, res) => {
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

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    )

    res.status(201).json({ 
        token, 
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }
    })
})

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await user.isPasswordCorrect(password)
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    )

    res.json({ 
        token, 
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }
    })
})
