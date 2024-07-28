import { isAuthenticated } from '@/middleware/auth'
import { getUserBookmarkByCategory } from '@controllers/bookmarks'
import {
  createUserCategory,
  getUserCategories,
  getUserCategoryById,
  removeUserCategoryById
} from '@controllers/categories'
import express from 'express'

const router = express.Router()

router.post('/', isAuthenticated, createUserCategory)
router.get('/', isAuthenticated, getUserCategories)
router.get('/:categoryId/', isAuthenticated, getUserCategoryById)
router.delete('/:categoryId/', isAuthenticated, removeUserCategoryById)
router.get('/:categoryId/bookmarks/', isAuthenticated, getUserBookmarkByCategory)

export default router
