import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { schedule } from 'node-cron'
import Joi from 'joi'
import { IReplacements, replacePlaceholders, sendMail } from '@helpers/mailService'
import { generatePasswordHash, generateSixDigitCode } from '@helpers/auth'
import { containsLowercase, containsNumber, containsUppercase } from '@helpers/validators'
import { pool } from '@/db'
import userQueries from '@/queries/user'
import passwordRecoveryRequestQueries from '@/queries/passwordRecoveryRequest'
import { checkRecaptchaValidity } from '@helpers/recaptcha'

const validatePasswordRecoveryRequest = (values: Record<any, any>) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    recaptcha: Joi.string().required()
  })
  return schema.validate(values)
}
const sendPasswordRecoveryMail = async (email: string, replacements: IReplacements) => {
  const MailTemplate = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'public', 'html', 'PasswordRecoveryRequestMail.html'), 'utf-8')
  return await sendMail({
    to: email,
    subject: 'Complete the password recovery process',
    html: replacePlaceholders(MailTemplate, replacements)
  })
}

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
    const { isValid, error: recaptchaError } = await checkRecaptchaValidity(recaptcha)
    if (!isValid) {
      res.status(400).send(recaptchaError)
      return
    }
    // Check already exist password recovery request
    const getPasswordRecoveryRequestRes =
      await pool.query(passwordRecoveryRequestQueries.getPasswordRecoveryRequestByEmail, [email])
    const passwordRecoveryRequest = getPasswordRecoveryRequestRes.rows[0]
    if (passwordRecoveryRequest) {
      await sendPasswordRecoveryMail(email, { verification_code: passwordRecoveryRequest.verification_code })
      res.sendStatus(200)
      return
    }
    // Verify that the user exists in the system
    const userRes = await pool.query(userQueries.getUserByEmail, [email])
    if (!userRes.rowCount) {
      res.status(400).send('No user with this email was found')
      return
    }
    // Create new password recovery request
    const verificationCode = generateSixDigitCode()
    await pool.query(passwordRecoveryRequestQueries.createPasswordRecoveryRequest, [email, verificationCode])
    await sendPasswordRecoveryMail(email, { verification_code: verificationCode })
    res.sendStatus(201)
  } catch (error) {
    res.status(400).send(error)
  }
}

// Clear password recovery requests evert 15 minutes
if (process.env.DEV_MODE !== 'true') {
  schedule('*/15 * * * *', () => pool.query(passwordRecoveryRequestQueries.truncatePasswordRecoveryRequest))
}

const validatePasswordRecoveryRequestConfirmation = (values: Record<any, any>) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    verification_code: Joi.string().length(6).required(),
    password: Joi.string().required().min(8).custom(containsUppercase).custom(containsLowercase).custom(containsNumber),
    password_confirmation: Joi.string().required().equal(Joi.ref('password'))
  })
  return schema.validate(values)
}

export const confirmPasswordRecoveryRequest = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validatePasswordRecoveryRequestConfirmation(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }

    const { email, verification_code, password } = req.body
    // Check password recovery request existing
    const getPasswordRecoveryRequestRes =
      await pool.query(passwordRecoveryRequestQueries.getPasswordRecoveryRequestByEmail, [email])
    const passwordRecoveryRequest = getPasswordRecoveryRequestRes.rows[0]
    if (!passwordRecoveryRequest) {
      res.status(400).send('Password recovery request not found')
      return
    }
    if (passwordRecoveryRequest.verification_code !== verification_code) {
      res.status(400).send('Invalid verification code')
      return
    }
    // Update userprofile password
    await pool.query(userQueries.updateUserByEmail, [generatePasswordHash(password), passwordRecoveryRequest.email])
    // Remove password recovery request
    await pool.query(passwordRecoveryRequestQueries.deletePasswordRecoveryRequestById, [passwordRecoveryRequest.id])
    res.sendStatus(201)
  } catch (error) {
    res.status(400).send(error)
  }
}
