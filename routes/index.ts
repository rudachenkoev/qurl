import express from 'express'
import authRouter from './auth'
import bookmarksRouter from './bookmarks'
import categoriesRouter from './categories'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/categories', categoriesRouter)
router.use('/bookmarks', bookmarksRouter)

export default router
