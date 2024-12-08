import { isAuthenticated } from '@/middleware/auth'
import { getCurrentUser, getCurrentUserContacts, upsertCurrentUserContacts } from '@controllers/accounts'
import express from 'express'

const router = express.Router()

router.get('/me/', isAuthenticated, getCurrentUser)
router.get('/contacts/', isAuthenticated, getCurrentUserContacts)
router.post('/contacts/', isAuthenticated, upsertCurrentUserContacts)

export default router
