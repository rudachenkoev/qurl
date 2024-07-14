import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { schedule } from 'node-cron'
import Joi from 'joi'
import axios from 'axios'
import { IReplacements, replacePlaceholders, sendMail } from '@helpers/mailService'
import { generatePasswordHash, generateAccessToken, generateSixDigitCode } from '@helpers/auth'
import { containsLowercase, containsNumber, containsUppercase } from '@helpers/validators'
import { pool } from '@/db'
import userQueries from '@/queries/user'
import registrationRequestQueries from '@/queries/registrationRequest'
import jwtTokenQueries from '@/queries/jwtToken'

const validateRegistrationRequest = (values: Record<any, any>) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    recaptcha: Joi.string().required()
  })
  return schema.validate(values)
}
const sendVerificationEmail = async (email: string, replacements: IReplacements) => {
  const MailTemplate = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'public', 'html', 'RegistrationRequestMail.html'), 'utf-8')
  return await sendMail({
    to: email,
    subject: 'Complete the registration process',
    html: replacePlaceholders(MailTemplate, replacements)
  })
}

const checkRecaptchaValidity = async (value: String) => {
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${value}`
  const response = await axios.post(url)
  return {
    isValid: response.data.success,
    error: !response.data.success ? response.data['error-codes'][0] : ''
  }
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
    const { isValid, error: recaptchaError } = await checkRecaptchaValidity(recaptcha)
    if (!isValid) {
      res.status(400).send(recaptchaError)
      return
    }
    // Check already exist registration request
    const getRegistrationRequestRes =
      await pool.query(registrationRequestQueries.getRegistrationRequestByEmail, [email])
    const registrationRequest = getRegistrationRequestRes.rows[0]
    if (registrationRequest) {
      await sendVerificationEmail(email, { verification_code: registrationRequest.verification_code })
      res.sendStatus(200)
      return
    }
    // Check already created user with email
    const userRes = await pool.query(userQueries.getUserByEmail, [email])
    if (userRes.rowCount) {
      res.status(400).send('A user with this email address already exists')
      return
    }
    // Create new registration request
    const verificationCode = generateSixDigitCode()
    await pool.query(registrationRequestQueries.createRegistrationRequest, [email, verificationCode])
    await sendVerificationEmail(email, { verification_code: verificationCode })
    res.sendStatus(201)
  } catch (error) {
    res.status(400).send(error)
  }
}

// Clear registration requests evert 15 minutes
if (process.env.DEV_MODE !== 'true') {
  schedule('*/15 * * * *', () => pool.query(registrationRequestQueries.truncateRegistrationRequest))
}

const validateRegistrationRequestConfirmation = (values: Record<any, any>) => {
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
    const getRegistrationRequestRes =
      await pool.query(registrationRequestQueries.getRegistrationRequestByEmail, [email])
    const registrationRequest = getRegistrationRequestRes.rows[0]
    if (!registrationRequest) {
      res.status(400).send('Registration request not found')
      return
    }
    if (registrationRequest.verification_code !== verification_code) {
      res.status(400).send('Invalid verification code')
      return
    }
    // Create new user profile
    const createUserRes = await pool.query(
      userQueries.createUser, [registrationRequest.email, generatePasswordHash(password)])
    const user = createUserRes.rows[0]
    // Remove registration request
    await pool.query(registrationRequestQueries.deleteRegistrationRequestById, [registrationRequest.id])
    // Add jwt authorization token
    const accessToken = generateAccessToken(user.id)
    await pool.query(jwtTokenQueries.createJwtToken, [user.id, accessToken])

    res.status(201).json({ bearer: accessToken })
  } catch (error) {
    res.status(400).send(error)
  }
}
