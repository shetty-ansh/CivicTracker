import { Complaints } from '../models/complaints-model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Comment } from '../models/comments-model.js'
import { User } from '../models/users-model.js'

export const createComplaint = asyncHandler(async (req, res) => {
    // Debug: Log the request body to see what's being received
    console.log('Request body:', req.body)
    console.log('Request file:', req.file)
    console.log('Authenticated user:', req.user)

    
    const body = req.body || {}

    // Validate required fields
    if (!body.title || !body.description || !body.category) {
        return res.status(400).json({ 
            message: 'Title, description, and category are required',
            received: {
                title: body.title,
                description: body.description,
                category: body.category
            }
        })
    }

    if (req.file && req.file.path) {
        body.images = [req.file.path]
    }

    // Handle location
    if (body.lng && body.lat) {
        body.location = {
            type: 'Point',
            coordinates: [parseFloat(body.lng), parseFloat(body.lat)]
        }
    }

    // Handle anonymous vs authenticated complaints
    if (body.anonymous === 'true' || body.anonymous === true) {
        body.anonymous = true
        // Don't set author for anonymous complaints
        delete body.author
    } else if (req.user) {
        // Set author only for non-anonymous complaints with authenticated user
        body.author = req.user._id
        body.anonymous = false
    }

    const c = await Complaints.create(body)
    
    // Populate author information in response if not anonymous
    const populatedComplaint = await Complaints.findById(c._id)
        .populate('author', 'username fullName role')
    
    res.status(201).json(populatedComplaint)
})

export const getComplaints = asyncHandler(async (req, res) => {
    const q = {}

    if (req.query.category) q.category = req.query.category
    if (req.query.status) q.status = req.query.status

    if (req.query.near) {
        const [lng, lat] = req.query.near.split(',').map(Number)
        q.location = {
            $near: {
                $geometry: { type: 'Point', coordinates: [lng, lat] },
                $maxDistance: 50000
            }
        }
    }

    const list = await Complaints.find(q).populate('author', 'username role fullName')
    res.json(list)
})

export const getComplaint = asyncHandler(async (req, res) => {
    const c = await Complaints.findById(req.params.id).populate('author', 'username role fullName')
    if (!c) return res.status(404).json({ message: 'Complaint not found' })
    res.json(c)
})

export const comment = asyncHandler(async (req, res) => {
    const c = await Complaints.findById(req.params.id)
    if (!c) return res.status(404).json({ message: 'Complaint not found' })
    
    if (!req.body.text) {
        return res.status(400).json({ message: 'Comment text is required' })
    }
    
    const newComment = await Comment.create({ user: req.user._id, text: req.body.text })
    c.comments.push(newComment._id)
    await c.save()
    res.json(await c.populate({ path: 'comments', populate: { path: 'user', select: 'username fullName' } }))
})

export const vote = asyncHandler(async (req, res) => {
    const c = await Complaints.findById(req.params.id)
    if (!c) return res.status(404).json({ message: 'Complaint not found' })
    const uid = req.user._id
    const { type } = req.body // 'upvote' or 'downvote'

    if (type === 'upvote') {
        const upvoteExists = c.upvotes.find(x => x.equals(uid))
        const downvoteExists = c.downvotes.find(x => x.equals(uid))
        
        if (upvoteExists) {
            c.upvotes = c.upvotes.filter(x => !x.equals(uid))
        } else {
            c.upvotes.push(uid)
            if (downvoteExists) {
                c.downvotes = c.downvotes.filter(x => !x.equals(uid))
            }
        }
    } else if (type === 'downvote') {
        const downvoteExists = c.downvotes.find(x => x.equals(uid))
        const upvoteExists = c.upvotes.find(x => x.equals(uid))
        
        if (downvoteExists) {
            c.downvotes = c.downvotes.filter(x => !x.equals(uid))
        } else {
            c.downvotes.push(uid)
            if (upvoteExists) {
                c.upvotes = c.upvotes.filter(x => !x.equals(uid))
            }
        }
    }

    await c.save()
    res.json({ 
        upvotes: c.upvotes.length, 
        downvotes: c.downvotes.length,
        userVote: c.upvotes.find(x => x.equals(uid)) ? 'upvote' : 
                 c.downvotes.find(x => x.equals(uid)) ? 'downvote' : null
    })
})

export const bookmark = asyncHandler(async (req, res) => {
    const c = await Complaints.findById(req.params.id)
    if (!c) return res.status(404).json({ message: 'Complaint not found' })
    const uid = req.user._id

    const exists = c.bookmarks.find(x => x.equals(uid))
    if (exists) {
        c.bookmarks = c.bookmarks.filter(x => !x.equals(uid))
    } else {
        c.bookmarks.push(uid)
    }

    await c.save()
    res.json({ bookmarked: !exists, count: c.bookmarks.length })
})

export const updateStatus = asyncHandler(async (req, res) => {
    const c = await Complaints.findById(req.params.id)
    if (!c) return res.status(404).json({ message: 'Complaint not found' })
    
    if (!req.body.status) {
        return res.status(400).json({ message: 'Status is required' })
    }
    
    const oldStatus = c.status
    c.status = req.body.status

    if (req.body.assignedTo) {
        c.assignedTo = req.body.assignedTo
    }
    
    if (req.body.department) {
        c.department = req.body.department
    }
    
    if (req.body.priority) {
        c.priority = req.body.priority
    }

    // Track status history
    c.statusHistory.push({
        status: req.body.status,
        changedBy: req.user._id,
        notes: req.body.notes || ''
    })

    // Set resolved date if status is resolved
    if (req.body.status === 'Resolved' && oldStatus !== 'Resolved') {
        c.resolvedAt = new Date()
    }

    await c.save()
    res.json(c)
})

// Get user's complaint history
export const getUserComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaints.find({ author: req.user._id })
        .populate('comments', 'text createdAt')
        .sort({ createdAt: -1 })
    
    res.json(complaints)
})

// Get user's bookmarked complaints
export const getUserBookmarks = asyncHandler(async (req, res) => {
    const complaints = await Complaints.find({ bookmarks: req.user._id })
        .populate('author', 'username fullName')
        .sort({ createdAt: -1 })
    
    res.json(complaints)
})

// Dashboard analytics for authorities
export const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await Promise.all([
        Complaints.countDocuments({ status: 'Pending' }),
        Complaints.countDocuments({ status: 'In Progress' }),
        Complaints.countDocuments({ status: 'Resolved' }),
        Complaints.countDocuments({ status: 'Rejected' }),
        Complaints.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),
        Complaints.aggregate([
            { $match: { resolvedAt: { $exists: true } } },
            { $project: {
                resolutionTime: {
                    $divide: [
                        { $subtract: ['$resolvedAt', '$createdAt'] },
                        1000 * 60 * 60 * 24 // Convert to days
                    ]
                }
            }},
            { $group: {
                _id: null,
                avgResolutionTime: { $avg: '$resolutionTime' },
                totalResolved: { $sum: 1 }
            }}
        ])
    ])

    const [pending, inProgress, resolved, rejected, categoryStats, resolutionStats] = stats
    
    res.json({
        statusCounts: { pending, inProgress, resolved, rejected },
        categoryBreakdown: categoryStats,
        resolutionMetrics: resolutionStats[0] || { avgResolutionTime: 0, totalResolved: 0 },
        totalComplaints: pending + inProgress + resolved + rejected
    })
})

// Get heatmap data for complaints
export const getHeatmapData = asyncHandler(async (req, res) => {
    const complaints = await Complaints.find({
        'location.coordinates': { $exists: true }
    }).select('location.coordinates category status')
    
    const heatmapData = complaints.map(c => ({
        lat: c.location.coordinates[1],
        lng: c.location.coordinates[0],
        category: c.category,
        status: c.status
    }))
    
    res.json(heatmapData)
})
