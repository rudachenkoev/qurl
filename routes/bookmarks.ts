import { isAuthenticated } from '@/middleware/auth'
import {
  createUserBookmark,
  getUserBookmarkById,
  getUserBookmarks,
  removeUserBookmarkById
} from '@controllers/bookmarks'
import express from 'express'

const router = express.Router()

router.post('/', isAuthenticated, createUserBookmark)
router.get('/', isAuthenticated, getUserBookmarks)
router.get('/:bookmarkId/', isAuthenticated, getUserBookmarkById)
router.delete('/:bookmarkId/', isAuthenticated, removeUserBookmarkById)

export default router
