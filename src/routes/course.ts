import express from 'express'
import { isAuthenticated } from '@middleware/auth'
import { createCourse, getCourses } from '@controllers/course'
const router = express.Router()

router.post('/', isAuthenticated, createCourse)
router.get('/', isAuthenticated, getCourses)
// router.get('/:id/', isAuthenticated, getFeedback)

export default router
