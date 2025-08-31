import { Announcement } from '../models/announcements-model.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Create announcement (Authority/Admin only)
export const createAnnouncement = asyncHandler(async (req, res) => {
    const { title, content, category, priority, expiresAt, targetAudience } = req.body

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' })
    }

    const announcement = await Announcement.create({
        title,
        content,
        category,
        priority,
        expiresAt,
        targetAudience,
        author: req.user._id
    })

    res.status(201).json(announcement)
})

// Get all active announcements
export const getAnnouncements = asyncHandler(async (req, res) => {
    const query = { 
        isActive: true,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gte: new Date() } }
        ]
    }

    // Filter by target audience if user is logged in
    if (req.user) {
        query.targetAudience = { $in: ['all', req.user.role === 'citizen' ? 'citizens' : 'authorities'] }
    } else {
        query.targetAudience = { $in: ['all', 'citizens'] }
    }

    const announcements = await Announcement.find(query)
        .populate('author', 'username fullName role')
        .sort({ priority: -1, createdAt: -1 })

    res.json(announcements)
})

// Get single announcement
export const getAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id)
        .populate('author', 'username fullName role')
    
    if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' })
    }

    res.json(announcement)
})

// Update announcement (Authority/Admin only)
export const updateAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id)
    
    if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' })
    }

    // Check if user is the author or admin
    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this announcement' })
    }

    Object.assign(announcement, req.body)
    await announcement.save()

    res.json(announcement)
})

// Delete/Deactivate announcement
export const deleteAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id)
    
    if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' })
    }

    // Check if user is the author or admin
    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this announcement' })
    }

    announcement.isActive = false
    await announcement.save()

    res.json({ message: 'Announcement deactivated successfully' })
})
