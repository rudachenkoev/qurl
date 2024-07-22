import { Request, Response } from 'express'
import { schedule } from 'node-cron'
import Joi, { ValidationResult } from 'joi'
import { sendVerificationCodeMail } from '@helpers/mailService'
import { generatePasswordHash, generateAccessToken, generateSixDigitCode } from '@helpers/auth'
import { containsLowercase, containsNumber, containsUppercase } from '@helpers/validators'
const { User, RegistrationRequest, Session } = require('@/models')

import { pool } from '@/db'
import registrationRequestQueries from '@/queries/registrationRequest'

const validateRegistrationRequest = (values: Record<string, any>): ValidationResult => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    // recaptcha: Joi.string().required()
  })
  return schema.validate(values)
}
const sendVerificationEmail = async (email: string, verificationCode: string) => {
  return sendVerificationCodeMail({
    to: email,
    subject: 'Complete registration process',
    replacements: {
      title: 'Complete registration process',
      text: 'To complete registration process, copy the verification code and paste it into the application. The code will be valid for 15 minutes.',
      verification_code: verificationCode
    }
  })
}

export const createRegistrationRequest = async (req: Request, res: Response) => {
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
    // const { isValid, error: recaptchaError } = await checkRecaptchaValidity(recaptcha)
    // if (!isValid) {
    //   res.status(400).send(recaptchaError)
    //   return
    // }
    // Check already exist registration request
    const registrationRequest = await RegistrationRequest.findOne({ where: { email } })
    if (registrationRequest) {
      await sendVerificationEmail(email, registrationRequest.verification_code)
      res.sendStatus(200)
      return
    }
    // Check already created user with email
    const user = await User.findOne({ where: { email } })
    if (user) {
      res.status(400).send('A user with this email address already exists')
      return
    }
    // Create new registration request
    const verificationCode = generateSixDigitCode()
    await RegistrationRequest.create({ email, verification_code: verificationCode })
    await sendVerificationEmail(email, verificationCode)
    res.sendStatus(201)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Clear registration requests evert 15 minutes
if (process.env.DEV_MODE !== 'true') {
  schedule('*/15 * * * *', () => pool.query(registrationRequestQueries.deleteRegistrationRequestInInterval))
}

const validateRegistrationRequestConfirmation = (values: Record<string, any>): ValidationResult => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    verification_code: Joi.string().length(6).required(),
    password: Joi.string().required().min(8).custom(containsUppercase).custom(containsLowercase).custom(containsNumber),
    password_confirmation: Joi.string().required().equal(Joi.ref('password'))
  })
  return schema.validate(values)
}

export const confirmRegistrationRequest = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validateRegistrationRequestConfirmation(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }

    const { email, verification_code, password } = req.body
    // Check registration request existing
    const registrationRequest = await RegistrationRequest.findOne({ where: { email } })
    if (!registrationRequest) {
      res.status(400).send('Registration request not found')
      return
    }
    if (registrationRequest.verification_code !== verification_code) {
      res.status(400).send('Invalid verification code')
      return
    }
    // Create new user profiles
    const user = await User.create({ email, password: generatePasswordHash(password) })
    // Remove registration request
    await RegistrationRequest.destroy({ where: { id: registrationRequest.id } })
    // Add jwt authorization token
    const accessToken = generateAccessToken(user.id)
    await Session.create({ user_id: user.id, token: accessToken })

    res.status(201).json({ bearer: accessToken })
  } catch (error) {
    res.status(500).send(error)
  }
}
