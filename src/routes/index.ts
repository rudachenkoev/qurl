import express from 'express'
import feedBackRoutes from './feedback'
import authRoutes from './auth'
import directoriesRoutes from './directories'
import courseRoutes from './course'

const router = express.Router()

router.use('/feedbacks', feedBackRoutes)
router.use('/auth', authRoutes)
router.use('/directories', directoriesRoutes)
router.use('/courses', courseRoutes)

export default router
