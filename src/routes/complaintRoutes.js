import express from 'express'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { protect, authorizeRoles } from '../middlewares/auth.js'
import { cloudinary } from '../utils/cloudinary.js'
import * as controller from '../controllers/complaintController.js'

const router = express.Router()

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'civictracker'
    }
})

const upload = multer({ storage })

router.post('/', protect, upload.single('image'), controller.createComplaint)
router.get('/', controller.getComplaints)
router.get('/:id', controller.getComplaint)
router.post('/:id/comment', protect, controller.comment)
router.post('/:id/vote', protect, controller.vote)
router.post('/:id/bookmark', protect, controller.bookmark)
router.patch('/:id/status', protect, authorizeRoles('authority', 'admin'), controller.updateStatus)

export default router
