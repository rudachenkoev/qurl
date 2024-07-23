const { schedule } = require('node-cron')
const Joi = require('joi')
const { sendVerificationCodeMail } = require('@helpers/mailService')
const { generateAccessToken, generateSixDigitCode } = require('@helpers/auth')
const { containsLowercase, containsNumber, containsUppercase } = require('@helpers/validators')
const { checkRecaptchaValidity } = require('@helpers/recaptcha')
const { User, RegistrationRequest, Session } = require('@/models')
const { Op } = require('sequelize')

const validateRegistrationRequest = values => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    recaptcha: Joi.string().required()
  })
  return schema.validate(values)
}

const sendVerificationEmail = async (email, verificationCode) => {
  if (process.env.DEV_MODE === 'true') return
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

// Handles the registration request by validating input, checking reCAPTCHA, and managing existing registration requests or users.
const createRegistrationRequest = async (req, res) => {
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
    const registrationRequest = await RegistrationRequest.findOne({ where: { email } })
    if (registrationRequest) {
      await sendVerificationEmail(email, registrationRequest.verification_code)
      res.sendStatus(200)
      return
    }
    // Check already created user with email
    const userAmount = await User.count({ where: { email } })
    if (userAmount) {
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
  schedule('*/15 * * * *', async () => {
    try {
      await RegistrationRequest.destroy({
        where: {
          createdAt: {
            [Op.lt]: new Date(Date.now() - 15 * 60 * 1000)
          }
        }
      })
      console.log('Old registration requests deleted successfully.')
    } catch (error) {
      console.error('Error deleting old registration requests:', error)
    }
  })
}

const validateRegistrationRequestConfirmation = values => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    verification_code: Joi.string().length(6).required(),
    password: Joi.string().required().min(8).custom(containsUppercase).custom(containsLowercase).custom(containsNumber)
  })
  return schema.validate(values)
}

// Confirms a registration request by validating the provided data, verifying the registration request, creating a user profile, and managing tokens and requests.
const confirmRegistrationRequest = async (req, res) => {
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
    const user = await User.create({ email, password })
    // Add jwt authorization token
    const accessToken = generateAccessToken(user.id)
    await Session.create({ user_id: user.id, token: accessToken })
    // Remove registration request
    await RegistrationRequest.destroy({ where: { id: registrationRequest.id } })

    res.status(201).json({ bearer: accessToken })
  } catch (error) {
    res.status(500).send(error)
  }
}

module.exports = {
  createRegistrationRequest,
  confirmRegistrationRequest
}
