import { AuthenticatedRequest } from '@/middleware/auth'
import { classifyTitleCategory, extractTitle, fetchPageTitle } from '@helpers/bookmark'
import { orderQuery, paginateQuery } from '@helpers/query'
import { Bookmark, PrismaClient } from '@prisma/client'
import { Response } from 'express'
import Joi, { ValidationResult } from 'joi'

const prisma = new PrismaClient()
const responseSerializer = {
  id: true,
  title: true,
  description: true,
  url: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true
}

const validateBookmark = (values: Bookmark): ValidationResult => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    url: Joi.string().uri().required(),
    categoryId: Joi.number().required()
  })
  return schema.validate(values)
}

// Creates a new bookmark for the authenticated user.
export const createUserBookmark = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check validation
    const { error } = validateBookmark(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }

    const { title, description, url, categoryId } = req.body
    // Get category information
    const category = await prisma.category.findFirst({
      where: {
        id: +categoryId,
        userId: req.userId
      }
    })
    if (!category) {
      res.status(400).send('No such category was found')
      return
    }
    // Create new bookmark
    const newBookmark = await prisma.bookmark.create({
      data: {
        title,
        description,
        url,
        category: {
          connect: { id: categoryId }
        },
        user: {
          connect: { id: category.userId }
        }
      },
      select: responseSerializer
    })
    res.status(201).send(newBookmark)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Retrieves bookmarks for the authenticated user.
export const getUserBookmarks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const pagination = paginateQuery(req.query)
    const ordering = orderQuery(req.query)

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: req.userId
      },
      select: responseSerializer,
      ...pagination,
      ...ordering
    })
    res.status(200).send(bookmarks)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Retrieves a specific bookmark for the authenticated user by its ID.
export const getUserBookmarkById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: req.userId,
        id: +req.params.bookmarkId
      },
      select: responseSerializer
    })
    if (!bookmark) {
      res.sendStatus(404)
      return
    }
    res.status(200).send(bookmark)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Retrieves a specific bookmark for the authenticated user by its ID.
export const getUserBookmarkByCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: req.userId,
        categoryId: +req.params.categoryId
      },
      select: responseSerializer
    })
    res.status(200).send(bookmarks)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Deletes a specific bookmark for the authenticated user by its ID.
export const removeUserBookmarkById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const bookmarksAmount = await prisma.bookmark.count({
      where: {
        userId: req.userId,
        id: +req.params.bookmarkId
      }
    })
    if (!bookmarksAmount) {
      res.sendStatus(404)
      return
    }
    await prisma.bookmark.delete({
      where: {
        userId: req.userId,
        id: +req.params.bookmarkId
      }
    })
    res.sendStatus(204)
  } catch (error) {
    res.status(500).send(error)
  }
}

const validateBookmarkUrlData = (values: { url: string }): ValidationResult => {
  const schema = Joi.object({
    url: Joi.string().uri().required()
  })
  return schema.validate(values)
}
export const getBookmarkUrlData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check validation
    const { error } = validateBookmarkUrlData(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }
    // Get user categories
    const categories = await prisma.category.findMany({
      where: {
        userId: req.userId
      },
      select: {
        id: true,
        name: true
      }
    })
    // Get page title using puppeteer
    const originalTitle = await fetchPageTitle(req.body.url)
    // Classify title category
    const classifiedCategory = await classifyTitleCategory(originalTitle, categories)

    res.status(200).send({
      originalTitle,
      extractTitle: extractTitle(originalTitle),
      category: classifiedCategory
    })
  } catch (error) {
    res.status(500).send(error)
  }
}
