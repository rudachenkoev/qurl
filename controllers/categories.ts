import { AuthenticatedRequest } from '@/middleware/auth'
import { orderQuery, paginateQuery } from '@helpers/query'
import { Category, PrismaClient } from '@prisma/client'
import { Response } from 'express'
import Joi, { ValidationResult } from 'joi'

const prisma = new PrismaClient()
const responseSerializer = {
  id: true,
  name: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true
}

// Retrieves categories for the authenticated user.
export const getUserCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const pagination = paginateQuery(req.query)
    const ordering = orderQuery(req.query)

    const categories = await prisma.category.findMany({
      where: {
        userId: req.userId
      },
      select: responseSerializer,
      ...pagination,
      ...ordering
    })
    res.status(200).send(categories)
  } catch (error) {
    res.status(500).send(error)
  }
}

const validateCategory = (values: Category): ValidationResult => {
  const schema = Joi.object({
    name: Joi.string().required()
  })
  return schema.validate(values)
}

// Creates a new category for the authenticated user.
export const createUserCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check validation
    const { error } = validateCategory(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }
    // Create new user category
    const newCategory = await prisma.category.create({
      data: {
        name: req.body.name,
        user: {
          connect: { id: req.userId }
        }
      },
      select: responseSerializer
    })
    res.status(201).send(newCategory)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Retrieves a specific category for the authenticated user by its ID.
export const getUserCategoryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        userId: req.userId,
        id: +req.params.categoryId
      },
      select: responseSerializer
    })
    if (!category) {
      res.sendStatus(404)
      return
    }
    res.status(200).send(category)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Deletes a specific category for the authenticated user by its ID.
export const removeUserCategoryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        userId: req.userId,
        id: +req.params.categoryId
      },
      select: responseSerializer
    })
    if (!category) {
      res.sendStatus(404)
      return
    }
    if (category.isDefault) {
      res.status(400).send('You cannot delete a default category')
      return
    }
    await prisma.category.delete({
      where: {
        userId: req.userId,
        id: +req.params.categoryId
      }
    })
    res.sendStatus(204)
  } catch (error) {
    res.status(500).send(error)
  }
}
