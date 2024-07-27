import { isAuthenticated } from '@/middleware/auth'
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
router.get('/:id/', isAuthenticated, getUserCategoryById)
router.delete('/:id/', isAuthenticated, removeUserCategoryById)

export default router
