import express from 'express'
import { getCourseCategories } from '@controllers/directories/courseCategory'

const router = express.Router()

router.get('/course-categories/', getCourseCategories)

export default router
