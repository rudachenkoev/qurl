import { isAuthenticated } from '@/middleware/auth'
import { getCurrentUser } from '@controllers/auth/accounts'
import express from 'express'

const router = express.Router()

router.get('/me/', isAuthenticated, getCurrentUser)

export default router
