import defaultCategories from '@/constants/defaultCategories'
import { generateAccessToken, generatePasswordHash, generateSixDigitCode } from '@helpers/auth'
import { sendVerificationCodeMail } from '@helpers/mailService'
import { checkRecaptchaValidity } from '@helpers/recaptcha'
import { containsLowercase, containsNumber, containsUppercase } from '@helpers/validators'
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import Joi, { ValidationResult } from 'joi'
import { schedule } from 'node-cron'

const prisma = new PrismaClient()

interface RegistrationRequestBody {
  email: string
  recaptcha?: string
}
const validateRegistrationRequest = (values: RegistrationRequestBody): ValidationResult => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    recaptcha: Joi.when(Joi.ref('$DEV_MODE'), {
      is: 'true',
      then: Joi.string().optional(),
      otherwise: Joi.string().required()
    })
  })
  const context = { DEV_MODE: process.env.DEV_MODE }
  return schema.validate(values, { context })
}

const sendVerificationEmail = async (email: string, verificationCode: string) => {
  if (process.env.DEV_MODE === 'true') return
  return sendVerificationCodeMail({
    to: email,
    subject: 'Complete registration process',
    replacements: {
      title: 'Complete registration process',
      text: 'To complete registration process, copy the verification code and paste it into the application. The code will be valid for 15 minutes.',
      verificationCode: verificationCode
    }
  })
}

// Handles the registration request by validating input, checking reCAPTCHA, and managing existing registration requests or users.
export const createRegistrationRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check validation
    const { error } = validateRegistrationRequest(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }

    const { email, recaptcha } = req.body
    // Check recaptcha validity
    if (recaptcha) {
      const { isValid, error: recaptchaError } = await checkRecaptchaValidity(recaptcha)
      if (!isValid) {
        res.status(400).send(recaptchaError)
        return
      }
    }
    // Check already exist registration request
    const registrationRequest = await prisma.registrationRequest.findUnique({ where: { email } })
    if (registrationRequest) {
      await sendVerificationEmail(email, registrationRequest.verificationCode)
      res.sendStatus(200)
      return
    }
    // Check already created user with email
    const userAmount = await prisma.user.count({ where: { email } })
    if (userAmount) {
      res.status(400).send('A user with this email address already exists')
      return
    }
    // Create new registration request
    const verificationCode = generateSixDigitCode()
    await prisma.registrationRequest.create({
      data: { email, verificationCode }
    })
    await sendVerificationEmail(email, verificationCode)
    res.sendStatus(201)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Clear registration requests evert 15 minutes
if (process.env.DEV_MODE !== 'true') {
  schedule('*/15 * * * *', async () => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    await prisma.registrationRequest.deleteMany({
      where: {
        createdAt: {
          lt: fifteenMinutesAgo
        }
      }
    })
  })
}

interface RegistrationConfirmationBody {
  email: string
  verificationCode: string
  password: string
}
const validateRegistrationRequestConfirmation = (values: RegistrationConfirmationBody): ValidationResult => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    verificationCode: Joi.string().length(6).required(),
    password: Joi.string().required().min(8).custom(containsUppercase).custom(containsLowercase).custom(containsNumber)
  })
  return schema.validate(values)
}

// Confirms a registration request by validating the provided data, verifying the registration request, creating a user profile, and managing tokens and requests.
export const confirmRegistrationRequest = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validateRegistrationRequestConfirmation(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }

    const { email, verificationCode, password } = req.body
    // Check registration request existing
    const registrationRequest = await prisma.registrationRequest.findFirst({ where: { email } })
    if (!registrationRequest) {
      res.status(400).send('Registration request not found')
      return
    }
    if (registrationRequest.verificationCode !== verificationCode) {
      res.status(400).send('Invalid verification code')
      return
    }
    // Create new user profiles with default categories
    const user = await prisma.user.create({
      data: {
        email,
        password: generatePasswordHash(password),
        categories: {
          create: defaultCategories
        }
      }
    })
    // Add jwt authorization token
    const token = generateAccessToken(user.id)
    await prisma.session.create({
      data: { userId: user.id, token }
    })
    // Remove registration request
    await prisma.registrationRequest.delete({ where: { id: registrationRequest.id } })

    res.status(201).json({ bearer: token })
  } catch (error) {
    res.status(500).send(error)
  }
}
