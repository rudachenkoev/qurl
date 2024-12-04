import prisma from '@/services/prisma'
import { generateAccessToken, generatePasswordHash } from '@helpers/auth'
import { Request, Response } from 'express'
import Joi, { ValidationResult } from 'joi'

interface LoginValues {
  email: string
  password: string
}
const validateLogin = (values: LoginValues): ValidationResult => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
  return schema.validate(values)
}

// Handles user login by validating credentials, checking user existence, and managing authentication tokens.
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check validation
    const { error } = validateLogin(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }

    const { email, password } = req.body
    // Find user by credits
    const user = await prisma.user.findUnique({
      where: {
        email,
        password: generatePasswordHash(password)
      }
    })
    if (!user) {
      res.status(400).send('No user information was found or the data is incorrect')
      return
    }
    // Update the current or create a new authorization token
    const token = generateAccessToken(user.id)

    await prisma.session.upsert({
      where: { userId: user.id },
      update: { token },
      create: { userId: user.id, token }
    })

    res.status(200).json({ bearer: token })
  } catch (error) {
    res.status(500).send(error)
  }
}
