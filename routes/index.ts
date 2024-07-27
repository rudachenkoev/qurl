import express from 'express'
import authRouter from './auth'
import categoriesRouter from './categories'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/categories', categoriesRouter)

export default router
