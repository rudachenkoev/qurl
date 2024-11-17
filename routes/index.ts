import express from 'express'
import accountsRouter from './accounts'
import authRouter from './auth'
import bookmarksRouter from './bookmarks'
import categoriesRouter from './categories'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/categories', categoriesRouter)
router.use('/bookmarks', bookmarksRouter)
router.use('/accounts', accountsRouter)

export default router
