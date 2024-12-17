import { AuthenticatedRequest } from '@/middleware/auth'
import prisma from '@/services/prisma'
import { Contact } from '@prisma/client'
import { Response } from 'express'
import Joi, { ValidationResult } from 'joi'

const responseSerializer = {
  id: true,
  email: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  contactsSyncAt: true,
  calendarSyncAt: true
}
// Retrieves the current authenticated user.
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId
      },
      select: responseSerializer
    })
    if (!user) {
      res.sendStatus(404)
      return
    }
    if (!user.isActive) {
      res.status(400).send('User was deactivated')
      return
    }
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Retrieves the current authenticated user contacts.
export const getCurrentUserContacts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        userId: req.userId
      }
    })
    res.status(200).send(contacts)
  } catch (error) {
    res.status(500).send(error)
  }
}

const validateUserContacts = (values: Contact[]): ValidationResult => {
  const schema = Joi.array()
    .items(
      Joi.object({
        id: Joi.string()
          .regex(/^[0-9a-fA-F-]{36}/)
          .required(),
        name: Joi.string().required(),
        birthday: Joi.alternatives().try(Joi.string().allow(''), Joi.date().iso())
      })
    )
    .min(1)
  return schema.validate(values)
}

// Synchronize contacts for the authenticated user.
export const upsertCurrentUserContacts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Check validation
  const { error } = validateUserContacts(req.body)
  if (error) {
    const errors = error.details.map(item => item.message)
    res.status(400).send(errors)
    return
  }

  try {
    const transaction = req.body.map((contact: Contact) => {
      return prisma.contact.upsert({
        where: {
          userId_externalId: {
            userId: req.userId!,
            externalId: contact.id
          }
        },
        update: {
          birthday: contact.birthday,
          name: contact.name
        },
        create: {
          externalId: contact.id,
          birthday: contact.birthday,
          name: contact.name,
          user: {
            connect: { id: req.userId }
          }
        }
      })
    })

    await prisma.$transaction(transaction)

    await prisma.user.update({
      where: {
        id: req.userId
      },
      data: {
        contactsSyncAt: new Date().toISOString()
      }
    })

    res.status(200)
  } catch (error) {
    console.log('error', error)
    res.status(500).send(error)
  }
}
