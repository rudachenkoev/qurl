import { isAuthenticated } from '@/middleware/auth'
import { getUserBookmarkByCategory } from '@controllers/bookmarks'
import {
  createUserCategory,
  getUserCategories,
  getUserCategoryById,
  removeUserCategoryById,
  updateUserCategoryById
} from '@controllers/categories'
import express from 'express'

const router = express.Router()

router.post('/', isAuthenticated, createUserCategory)
router.get('/', isAuthenticated, getUserCategories)
router.get('/:categoryId/', isAuthenticated, getUserCategoryById)
router.patch('/:categoryId/', isAuthenticated, updateUserCategoryById)
router.delete('/:categoryId/', isAuthenticated, removeUserCategoryById)
router.get('/:categoryId/bookmarks/', isAuthenticated, getUserBookmarkByCategory)

export default router
