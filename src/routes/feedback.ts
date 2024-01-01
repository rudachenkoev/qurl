import express from 'express'
import { getFeedbacks, createFeedback, getFeedback } from '@controllers/feedback'
import { isAuthenticated } from '@middleware/auth'
const router = express.Router()

router.post('/', createFeedback)
router.get('/', isAuthenticated, getFeedbacks)
router.get('/:id/', isAuthenticated, getFeedback)

export default router
