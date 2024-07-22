import express from 'express'
import authRoutes from './auth'
import directoriesRoutes from './directories'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/directories', directoriesRoutes)

export default router
