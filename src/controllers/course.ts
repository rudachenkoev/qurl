import { Request, Response } from 'express'
import Joi from 'joi'
import { createCourse as createItem, getCourses as getItems } from '@models/course'
import { promotionPeriods } from '@/constants/course'
import { languages } from '@/constants'
import { ExtendedRequest } from '@middleware/auth'

const validateCourse = (values: Record<any, any>) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    courseCategory: Joi.string().required(),
    price: Joi.number().required(),
    promotionPeriod: Joi.string().valid(...promotionPeriods.map(item => item.id)).allow(null),
    language: Joi.string().valid(...languages).required()
  })
  return schema.validate(values)
}

export const getCourses = async (req: Request, res: Response) => {
  try {
    const result = await getItems()
    return res.status(200).json(result)
  } catch (error) {
    res.status(400).send(error)
  }
}

export const createCourse = async (req: ExtendedRequest, res: Response) => {
  try {
    // Check validation
    const { error } = validateCourse(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      return res.status(400).send(errors)
    }
    req.body.author = req.userObjectId
    // Create new Course
    const result = await createItem(req.body)
    return res.status(201).json(result)
  } catch (error) {
    res.status(400).send(error)
  }
}
