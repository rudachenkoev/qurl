import express from 'express'
import feedBackRoutes from './feedback'
import authRoutes from './auth'
import directoriesRoutes from './directories'

const router = express.Router()

router.use('/feedbacks', feedBackRoutes)
router.use('/auth', authRoutes)
router.use('/directories', directoriesRoutes)

export default router
