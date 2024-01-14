import { Schema, model } from 'mongoose'

const CourseCategorySchema = new Schema({
  name: {
    en: { type: String, required: true },
    de: { type: String, required: true },
    fr: { type: String, required: true },
    es: { type: String, required: true },
    it: { type: String, required: true }
  }
})

export const CourseCategoryModel = model('directories_CourseCategory', CourseCategorySchema)
export const getCourseCategories = () => CourseCategoryModel.find()
