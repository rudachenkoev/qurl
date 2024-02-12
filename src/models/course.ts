import { Schema, model } from 'mongoose'
import { promotionPeriods, tags } from '@/constants/course'
import { languages } from '@/constants'
type ICourse = {
}


const CourseSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  courseCategory: {
    type: Schema.Types.ObjectId,
    ref: 'directories_CourseCategory',
    required: true
  },
  // poster: {
  //   type: String,
  //   default: ''
  // },
  timesSold: {
    type: Number,
    default: 0
  },
  tag: {
    type: String,
    default: null,
    validate: {
      validator: function(value: any) {
        if (value) return tags.some(period => period.id === value)
        else return value === null
      },
      message: 'Invalid tag'
    }
  },
  price: {
    type: Number,
    set: function (value: number) { return value.toFixed(2) },
    required: true
  },
  promotionPeriod: {
    type: Number,
    default: null,
    validate: {
      validator: function(value: any) {
        if (value) return promotionPeriods.some(period => period.id === value)
        else return value === null
      },
      message: 'Invalid promotion period'
    }
  },
  promotionValidTo: {
    type: Date,
    default: null
  },
  language: {
    type: String,
    enum: languages,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

export const CourseModel = model('Course', CourseSchema)
export const getCourses = () => CourseModel.find()
// export const getCourseById = (id: string) => CourseModel.findById(id)
export const createCourse = (attr: ICourse) => new CourseModel(attr).save().then(item => item.toObject())
