import { AuthenticatedRequest } from '@/middleware/auth'
import prisma from '@/services/prisma'
import { classifyTitleCategory, extractTitle, fetchPageInfo } from '@helpers/bookmark'
import { handleQueryResponse } from '@helpers/query'
import { Bookmark } from '@prisma/client'
import { Response } from 'express'
import Joi, { ValidationResult } from 'joi'

const responseSerializer = {
  id: true,
  title: true,
  description: true,
  url: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  contacts: true
}

const validateBookmark = (values: Bookmark): ValidationResult => {
  const schema = Joi.object({
    url: Joi.string().uri().required(),
    title: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    categoryId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    contacts: Joi.array().items(Joi.string())
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

    const { title, description, url, categoryId, contacts } = req.body
    // Create or check exist category
    let categoryIdToUse = categoryId

    if (typeof categoryId === 'string') {
      const newCategory = await prisma.category.create({
        data: {
          name: categoryId,
          user: {
            connect: { id: req.userId }
          }
        }
      })
      categoryIdToUse = newCategory.id
    } else {
      const existedCategory = await prisma.category.findUnique({
        where: {
          id: categoryId,
          userId: req.userId
        }
      })
      if (!existedCategory) {
        res.status(400).send('No such category was found')
        return
      }
    }

    // Create new bookmark
    const newBookmark = await prisma.bookmark.create({
      data: {
        title,
        description,
        url,
        category: {
          connect: { id: categoryIdToUse }
        },
        user: {
          connect: { id: req.userId }
        },
        ...(contacts.length > 0 && {
          contacts: {
            create: contacts.map((contactId: string) => ({ contactId }))
          }
        })
      },
      select: responseSerializer
    })

    res.status(201).send(newBookmark)
  } catch (error) {
    res.status(500).send(error)
  }
}

export const updateUserBookmarkById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check validation
    const { error } = validateBookmark(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }

    const { title, description, url, categoryId, contacts } = req.body

    // Get category information
    const category = await prisma.category.findUnique({
      where: {
        id: +categoryId,
        userId: req.userId
      }
    })
    if (!category) {
      res.status(400).send('No such category was found')
      return
    }

    // Update bookmark with new data
    const updatedBookmark = await prisma.bookmark.update({
      where: {
        id: +req.params.bookmarkId
      },
      data: {
        title,
        description,
        url,
        category: {
          connect: { id: categoryId }
        },
        ...(contacts.length > 0 && {
          contacts: {
            deleteMany: {},
            create: contacts.map((contactId: string) => ({ contactId }))
          }
        })
      },
      select: responseSerializer
    })

    res.status(200).send(updatedBookmark)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Retrieves bookmarks for the authenticated user.
export const getUserBookmarks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const response = await handleQueryResponse('bookmark', {
      query: req.query,
      where: { userId: req.userId },
      select: responseSerializer
    })
    res.status(200).send(response)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Retrieves a specific bookmark for the authenticated user by its ID.
export const getUserBookmarkById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const bookmark = await prisma.bookmark.findUnique({
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
    // Get page info using puppeteer
    const { title, description } = await fetchPageInfo(req.body.url)
    // Classify title category
    const classification = await classifyTitleCategory(title, categories)

    res.status(200).send({
      title: extractTitle(title) || title,
      description,
      classification
    })
  } catch (error) {
    res.status(500).send(error)
  }
}
