import { Request, Response } from 'express'
import Joi from 'joi'
import {
  createFeedback as createItem,
  getFeedbackById as getItem,
  getFeedbacks as getItems
} from '@models/feedback'

const validateFeedback = (values: Record<any, any>) => {
  const schema = Joi.object({
    category: Joi.string().valid('error', 'appeal', 'promotions_and_offers').required(),
    text: Joi.when('category', {
      is: Joi.valid('error', 'appeal'),
      then: Joi.string().required(),
      otherwise: Joi.string()
    }),
    email: Joi.when('category', {
      is: 'promotions_and_offers',
      then: Joi.string().email().required(),
      otherwise: Joi.string().email()
    })
  })
  return schema.validate(values)
}

export const getFeedbacks = async (req: Request, res: Response) => {
  try {
    const result = await getItems()
    return res.status(200).json(result)
  } catch (error) {
    res.status(400).send(error)
  }
}

export const createFeedback = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validateFeedback(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      return res.status(400).send(errors)
    }
    // Create new feedback
    const result = await createItem(req.body)
    return res.status(201).json(result)
  } catch (error) {
    res.status(400).send(error)
  }
}

export const getFeedback = async (req: Request, res: Response) => {
  try {
    const result = await getItem(req.params.id)
    if (result) return res.status(200).json(result)
    return res.status(404).send('Feedback was not found')
  } catch (error) {
    res.status(400).send(error)
  }
}
