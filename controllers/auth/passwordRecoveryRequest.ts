import { generateAccessToken, generatePasswordHash, generateSixDigitCode } from '@helpers/auth'
import { sendVerificationCodeMail } from '@helpers/mailService'
import { checkRecaptchaValidity } from '@helpers/recaptcha'
import { containsLowercase, containsNumber, containsUppercase } from '@helpers/validators'
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import Joi, { ValidationResult } from 'joi'
import { schedule } from 'node-cron'

const prisma = new PrismaClient()

interface PasswordRecoveryRequestBody {
  email: string
  recaptcha?: string
}
const validatePasswordRecoveryRequest = (values: PasswordRecoveryRequestBody): ValidationResult => {
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

const sendPasswordRecoveryMail = async (email: string, verificationCode: string) => {
  if (process.env.DEV_MODE === 'true') return
  return sendVerificationCodeMail({
    to: email,
    subject: 'Complete password recovery process',
    replacements: {
      title: 'Complete password recovery process',
      text: 'To complete password recovery process, copy the verification code and paste it into the application. The code will be valid for 15 minutes.',
      verificationCode: verificationCode
    }
  })
}

// Handles the creation of a password recovery request by validating input, checking reCAPTCHA, and managing existing or new recovery requests.
export const createPasswordRecoveryRequest = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validatePasswordRecoveryRequest(req.body)
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
    // Check already exist password recovery request
    const passwordRecoveryRequest = await prisma.passwordRecoveryRequest.findUnique({ where: { email } })
    if (passwordRecoveryRequest) {
      await sendPasswordRecoveryMail(email, passwordRecoveryRequest.verificationCode)
      res.sendStatus(200)
      return
    }
    // Verify that the user exists in the system
    const userAmount = await prisma.user.count({ where: { email } })
    if (!userAmount) {
      res.status(400).send('No user with this email was found')
      return
    }
    // Create new password recovery request
    const verificationCode = generateSixDigitCode()
    await prisma.passwordRecoveryRequest.create({
      data: { email, verificationCode }
    })
    await sendPasswordRecoveryMail(email, verificationCode)
    res.sendStatus(201)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Clear password recovery requests evert 15 minutes
if (process.env.DEV_MODE !== 'true') {
  schedule('*/15 * * * *', async () => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    await prisma.passwordRecoveryRequest.deleteMany({
      where: {
        createdAt: {
          lt: fifteenMinutesAgo
        }
      }
    })
  })
}

interface PasswordRecoveryConfirmationBody {
  email: string
  verificationCode: string
  password: string
}
const validatePasswordRecoveryRequestConfirmation = (values: PasswordRecoveryConfirmationBody): ValidationResult => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    verificationCode: Joi.string().length(6).required(),
    password: Joi.string().required().min(8).custom(containsUppercase).custom(containsLowercase).custom(containsNumber)
  })
  return schema.validate(values)
}

// Confirms a password recovery request by validating the input, verifying the recovery request, updating the user password, and managing authentication tokens.
export const confirmPasswordRecoveryRequest = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validatePasswordRecoveryRequestConfirmation(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }

    const { email, verificationCode, password } = req.body
    // Check password recovery request existing
    const passwordRecoveryRequest = await prisma.passwordRecoveryRequest.findUnique({ where: { email } })
    if (!passwordRecoveryRequest) {
      res.status(400).send('Password recovery request not found')
      return
    }
    if (passwordRecoveryRequest.verificationCode !== verificationCode) {
      res.status(400).send('Invalid verification code')
      return
    }
    // Update userprofile password
    const updateUser = await prisma.user.update({
      where: { email },
      data: { password: generatePasswordHash(password) }
    })
    // Update the current or create a new authorization token
    const token = generateAccessToken(updateUser.id)
    await prisma.session.upsert({
      where: { userId: updateUser.id },
      update: { token },
      create: { userId: updateUser.id, token }
    })
    // Remove password recovery request
    await prisma.passwordRecoveryRequest.delete({ where: { id: passwordRecoveryRequest.id } })

    res.status(201).json({ bearer: token })
  } catch (error) {
    res.status(500).send(error)
  }
}
