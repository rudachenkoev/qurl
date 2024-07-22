import { Request, Response } from 'express'
import { schedule } from 'node-cron'
import Joi, { ValidationResult  } from 'joi'
import { sendVerificationCodeMail } from '@helpers/mailService'
import { generateAccessToken, generatePasswordHash, generateSixDigitCode } from '@helpers/auth'
import { containsLowercase, containsNumber, containsUppercase } from '@helpers/validators'
import { pool } from '@/db'
import userQueries from '@/queries/user'
import passwordRecoveryRequestQueries from '@/queries/passwordRecoveryRequest'
import jwtTokenQueries from '@/queries/jwtToken'
import { checkRecaptchaValidity } from '@helpers/recaptcha'

const validatePasswordRecoveryRequest = (values: Record<string, any>): ValidationResult  => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    recaptcha: Joi.string().required()
  })
  return schema.validate(values)
}
const sendPasswordRecoveryMail = async (email: string, verificationCode: string) => {
  return sendVerificationCodeMail({
    to: email,
    subject: 'Complete password recovery process',
    replacements: {
      title: 'Complete password recovery process',
      text: 'To complete password recovery process, copy the verification code and paste it into the application. The code will be valid for 15 minutes.',
      verification_code: verificationCode
    }
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
      await sendPasswordRecoveryMail(email, passwordRecoveryRequest.verification_code)
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
    await sendPasswordRecoveryMail(email, verificationCode)
    res.sendStatus(201)
  } catch (error) {
    res.status(400).send(error)
  }
}

// Clear password recovery requests evert 15 minutes
if (process.env.DEV_MODE !== 'true') {
  schedule('*/15 * * * *', () => pool.query(passwordRecoveryRequestQueries.deletePasswordRecoveryRequestInInterval))
}

const validatePasswordRecoveryRequestConfirmation = (values: Record<string, any>): ValidationResult => {
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
    const updateUserRes = await pool.query(userQueries.updateUserByEmail, [generatePasswordHash(password), passwordRecoveryRequest.email])
    const user = updateUserRes.rows[0]
    // Remove password recovery request
    await pool.query(passwordRecoveryRequestQueries.deletePasswordRecoveryRequestById, [passwordRecoveryRequest.id])
    // Update the current or create a new authorization token
    const getJwtTokenByUserRes = await pool.query(jwtTokenQueries.getJwtTokenByUser, [user.id])
    const userToken = getJwtTokenByUserRes.rows[0]
    const newToken = generateAccessToken(user.id)
    if (userToken) await pool.query(jwtTokenQueries.updateJwtTokenByUser, [newToken, user.id])
    else await pool.query(jwtTokenQueries.createJwtToken, [user.id, newToken])

    res.status(201).json({ bearer: newToken })
  } catch (error) {
    res.status(400).send(error)
  }
}
