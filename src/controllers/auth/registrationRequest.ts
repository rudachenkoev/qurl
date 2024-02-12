import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { schedule } from 'node-cron'
import Joi from 'joi'
import axios from 'axios'
import { getUserByEmail, getUserById } from '@models/user'
import { createRegistrationRequest, deleteRegistrationRequestById, getRegistrationRequestByEmail,
  getRegistrationRequestById } from '@models/auth/registrationRequest'
import { createUserProfile } from '@controllers/user'
import { IReplacements, replacePlaceholders, sendMail } from '@helpers/mailService'
import { authentication, generateAccessToken } from '@helpers/auth'
import { containsLowercase, containsNumber, containsUppercase } from '@helpers/validators'
import { dropCollection } from '@config/db'

// VERIFICATION REQUESTS
const validateRegistrationRequest = (values: Record<any, any>) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    recaptcha: Joi.string().required()
  })
  return schema.validate(values)
}
const sendVerificationEmail = async (email: string, requestId: string) => {
  const MailTemplate = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'html', 'RegistrationRequestMail.html'), 'utf-8')
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const replacements: IReplacements = {
    date: new Date().toLocaleString('en', { timeZone, hour12: false }),
    link: `${process.env.FRONT_URL}registration/confirmation/?requestId=${requestId}`,
    requestId
  }
  const mailDetails = {
    to: email,
    subject: 'Finish registration',
    html: replacePlaceholders(MailTemplate, replacements)
  }
  return await sendMail(mailDetails)
}
export const sendRegistrationVerificationRequest = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validateRegistrationRequest(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      return res.status(400).send(errors)
    }
    // Check recaptcha validity
    const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET
    const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${req.body.recaptcha}`)
    if (!recaptchaResponse.data.success) return res.status(400).send(recaptchaResponse.data['error-codes'][0])
    // Check already created user with email
    const user = await getUserByEmail(req.body.email)
    if (user) return res.status(400).send('A user with this mail already exists')
    // Check already exist registration request
    const request = await getRegistrationRequestByEmail(req.body.email)
    if (request) {
      await sendVerificationEmail(req.body.email, String(request._id))
      return res.sendStatus(200)
    }
    // Create new registration request
    const result = await createRegistrationRequest(req.body)
    await sendVerificationEmail(req.body.email, String(result._id))
    return res.sendStatus(201)
  } catch (error) {
    res.status(400).send(error)
  }
}

// Clear registration requests collection evert 15 minutes
if (process.env.DEV_MODE !== 'true') schedule('*/15 * * * *', () => dropCollection('auth_registrationrequests'))

// VERIFICATION REQUEST CONFIRMATION
const validateRegistrationRequestVerification = (values: Record<any, any>) => {
  const schema = Joi.object({
    requestId: Joi.required(),
    password: Joi.string().required().min(8).custom(containsUppercase).custom(containsLowercase).custom(containsNumber),
    passwordConfirmation: Joi.string().required().equal(Joi.ref('password'))
  })
  return schema.validate(values)
}
export const registrationRequestVerification = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validateRegistrationRequestVerification(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      return res.status(400).send(errors)
    }
    // Check registration request existing
    const { requestId, password } = req.body
    const request = await getRegistrationRequestById(requestId)
    if (!request) return res.status(400).send('Registration request has not been created before')
    // Create new user profile
    const body = {
      email: request.email,
      authentication: {
        password: authentication(password)
      }
    }
    const result = await createUserProfile(body)
    await deleteRegistrationRequestById(requestId) // Clear user registration request
    // @ts-ignore
    const user = await getUserById(result._id)
    user.authentication.sessionToken = generateAccessToken(user._id)
    await user.save()

    return res.status(201).json({ bearer: user.authentication.sessionToken })
  } catch (error) {
    res.status(400).send(error)
  }
}
