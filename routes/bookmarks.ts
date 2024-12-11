import { isAuthenticated } from '@/middleware/auth'
import {
  createUserBookmark,
  getBookmarkUrlData,
  getUserBookmarkById,
  getUserBookmarks,
  removeUserBookmarkById,
  updateUserBookmarkById
} from '@controllers/bookmarks'
import express from 'express'

const router = express.Router()

router.post('/', isAuthenticated, createUserBookmark)
router.get('/', isAuthenticated, getUserBookmarks)
router.get('/:bookmarkId/', isAuthenticated, getUserBookmarkById)
router.patch('/:bookmarkId/', isAuthenticated, updateUserBookmarkById)
router.delete('/:bookmarkId/', isAuthenticated, removeUserBookmarkById)
router.post('/autocomplete-url-data/', isAuthenticated, getBookmarkUrlData)

export default router
