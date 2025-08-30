import { Complaints } from '../models/complaints-model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Comment } from '../models/comments-model.js'

export const createComplaint = asyncHandler(async (req, res) => {
    // Debug: Log the request body to see what's being received
    console.log('Request body:', req.body)
    console.log('Request file:', req.file)
    
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

    if (req.user) {
        body.author = req.user._id
    }

    if (body.lng && body.lat) {
        body.location = {
            type: 'Point',
            coordinates: [parseFloat(body.lng), parseFloat(body.lat)]
        }
    }

    if (body.anonymous === 'true' || body.anonymous === true) {
        body.anonymous = true
        delete body.author
    }

    const c = await Complaints.create(body)
    res.status(201).json(c)
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

    const exists = c.upvotes.find(x => x.equals(uid))
    if (exists) {
        c.upvotes = c.upvotes.filter(x => !x.equals(uid))
    } else {
        c.upvotes.push(uid)
    }

    await c.save()
    res.json({ count: c.upvotes.length })
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
    
    c.status = req.body.status

    if (req.body.assignedTo) {
        c.assignedTo = req.body.assignedTo
    }

    await c.save()
    res.json(c)
})
