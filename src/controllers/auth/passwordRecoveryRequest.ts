import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { schedule } from 'node-cron'
import Joi from 'joi'
import { getUserByEmail } from '@models/user'
import { IReplacements, replacePlaceholders, sendMail } from '@helpers/mailService'
import { authentication, generateAccessToken } from '@helpers/auth'
import { containsLowercase, containsNumber, containsUppercase } from '@helpers/validators'
import { createPasswordRecoveryRequest, deletePasswordRecoveryRequestById, getPasswordRecoveryRequestByEmail,
  getPasswordRecoveryRequestById } from '@models/auth/passwordRecoveryRequest'
import { dropCollection } from '@config/db'

const validatePasswordRecoveryRequest = (values: Record<any, any>) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  })
  return schema.validate(values)
}
const sendPasswordRecoveryMail = async (email: string, requestId: string) => {
  const MailTemplate = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'html', 'PasswordRecoveryRequestMail.html'), 'utf-8')
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const replacements: IReplacements = {
    date: new Date().toLocaleString('en', { timeZone, hour12: false }),
    link: `${process.env.FRONT_URL}password-recovery/confirmation/?requestId=${requestId}`,
    requestId
  }
  const mailDetails = {
    to: email,
    subject: 'Password recovery request',
    html: replacePlaceholders(MailTemplate, replacements)
  }
  return await sendMail(mailDetails)
}
export const sendPasswordRecoveryRequest = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validatePasswordRecoveryRequest(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      return res.status(400).send(errors)
    }
    // Check existing email address
    const user = await getUserByEmail(req.body.email)
    if (!user) return res.status(404).send('No user information was found or the data is incorrect')
    // Check already exist request
    const request = await getPasswordRecoveryRequestByEmail(req.body.email)
    if (request) {
      await sendPasswordRecoveryMail(req.body.email, String(request._id))
      return res.sendStatus(200)
    }
    // Create new request
    const result = await createPasswordRecoveryRequest(req.body)
    await sendPasswordRecoveryMail(req.body.email, String(result._id))
    return res.sendStatus(201)
  } catch (error) {
    res.status(400).send(error)
  }
}

// Clear requests collection evert 15 minutes
if (process.env.DEV_MODE !== 'true') schedule('*/15 * * * *', () => dropCollection('auth_passwordrecoveryrequests'))

const validatePasswordRecoveryRequestVerification = (values: Record<any, any>) => {
  const schema = Joi.object({
    requestId: Joi.required(),
    password: Joi.string().required().min(8).custom(containsUppercase).custom(containsLowercase).custom(containsNumber),
    passwordConfirmation: Joi.string().required().equal(Joi.ref('password'))
  })
  return schema.validate(values)
}
export const passwordRecoveryRequestVerification = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validatePasswordRecoveryRequestVerification(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      return res.status(400).send(errors)
    }
    // Check request existing
    const { requestId, password } = req.body
    const request = await getPasswordRecoveryRequestById(requestId)
    if (!request) return res.status(400).send('Password recovery request has not been created before')
    // Get necessary user by email
    const user = await getUserByEmail(request.email)
    user.authentication.password = authentication(password)
    user.authentication.sessionToken = generateAccessToken(user._id)
    await user.save()
    await deletePasswordRecoveryRequestById(requestId) // Clear request
    return res.status(200).json({ bearer: user.authentication.sessionToken })
  } catch (error) {
    res.status(400).send(error)
  }
}
