import jwt from "jsonwebtoken";
import { User } from "../models/users-model.js";

export const protect = async (req, res, next) => {
    let token = null
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return res.status(401).json({ message: 'Not authorized, no token provided' })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')
        if (!user) {
            return res.status(401).json({ message: 'User not found' })
        }
        req.user = user
        next()
    } catch (err) {
        res.status(401).json({ message: 'Token invalid or expired' })
    }
}

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' })
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions' })
        }
        next()
    }
}