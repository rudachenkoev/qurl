const { schedule } = require('node-cron')
const Joi = require('joi')
const { sendVerificationCodeMail } = require('../../helpers/mailService')
const { generateAccessToken, generateSixDigitCode } = require('../../helpers/auth')
const { containsLowercase, containsNumber, containsUppercase } = require('../../helpers/validators')
const { checkRecaptchaValidity } = require('../../helpers/recaptcha')
const { User, PasswordRecoveryRequest, Session } = require('../../models')
const { Op } = require('sequelize')

const validatePasswordRecoveryRequest = values  => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    recaptcha: Joi.string().required()
  })
  return schema.validate(values)
}

const sendPasswordRecoveryMail = async (email, verificationCode) => {
  if (process.env.DEV_MODE === 'true') return
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

const createPasswordRecoveryRequest = async (req, res) => {
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
    const passwordRecoveryRequest = await PasswordRecoveryRequest.findOne({ where: { email } })
    if (passwordRecoveryRequest) {
      await sendPasswordRecoveryMail(email, passwordRecoveryRequest.verification_code)
      res.sendStatus(200)
      return
    }
    // Verify that the user exists in the system
    const userAmount = await User.count({ where: { email } })
    if (!userAmount) {
      res.status(400).send('No user with this email was found')
      return
    }
    // Create new password recovery request
    const verificationCode = generateSixDigitCode()
    await PasswordRecoveryRequest.create({ email, verification_code: verificationCode })
    await sendPasswordRecoveryMail(email, verificationCode)
    res.sendStatus(201)
  } catch (error) {
    res.status(500).send(error)
  }
}

// Clear password recovery requests evert 15 minutes
if (process.env.DEV_MODE !== 'true') {
  schedule('*/15 * * * *', async () => {
    try {
      await PasswordRecoveryRequest.destroy({
        where: {
          createdAt: {
            [Op.lt]: new Date(Date.now() - 15 * 60 * 1000)
          }
        }
      })
      console.log('Old password recovery requests deleted successfully.')
    } catch (error) {
      console.error('Error deleting old password recovery requests:', error)
    }
  })
}

const validatePasswordRecoveryRequestConfirmation = values => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    verification_code: Joi.string().length(6).required(),
    password: Joi.string().required().min(8).custom(containsUppercase).custom(containsLowercase).custom(containsNumber)
  })
  return schema.validate(values)
}

const confirmPasswordRecoveryRequest = async (req, res) => {
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
    const passwordRecoveryRequest = await PasswordRecoveryRequest.findOne({ where: { email } })
    if (!passwordRecoveryRequest) {
      res.status(400).send('Password recovery request not found')
      return
    }
    if (passwordRecoveryRequest.verification_code !== verification_code) {
      res.status(400).send('Invalid verification code')
      return
    }
    // Update userprofile password
    const [numberOfAffectedRows] = await User.update({ password }, { where: { email } })
    if (numberOfAffectedRows < 1) {
      res.status(400).send('Failed to update user information from request')
      return
    }
    // Update the current or create a new authorization token
    const user = User.findOne({ where: { email }})
    const newData = { token: generateAccessToken(user.id) }
    const [record, isCreated] = await Session.findOrCreate({
      where: { user_id: user.id },
      defaults: newData
    })
    if (!isCreated) await record.update(newData)
    // Remove password recovery request
    await PasswordRecoveryRequest.destroy({ where: { id: passwordRecoveryRequest.id } })

    res.status(201).json({ bearer: newData.token })
  } catch (error) {
    res.status(500).send(error)
  }
}

module.exports = {
  createPasswordRecoveryRequest,
  confirmPasswordRecoveryRequest
}
