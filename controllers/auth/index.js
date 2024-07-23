const Joi = require('joi')
const { generateAccessToken, generatePasswordHash } = require('@helpers/auth')
const { User, Session } = require('@/models')

const validateLogin = values => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
  return schema.validate(values)
}

// Handles user login by validating credentials, checking user existence, and managing authentication tokens.
const login = async (req, res) => {
  try {
    // Check validation
    const { error } = validateLogin(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }

    const { email, password } = req.body
    // Find user by credits
    const user = await User.findOne({
      where: {
        email,
        password: generatePasswordHash(password)
      }
    })
    if (!user) {
      res.status(400).send('No user information was found or the data is incorrect')
      return
    }
    // Update the current or create a new authorization token
    const newData = { token: generateAccessToken(user.id) }
    const [record, isCreated] = await Session.findOrCreate({
      where: { user_id: user.id },
      defaults: newData
    })
    if (!isCreated) await record.update(newData)

    res.status(200).json({ bearer: newData.token })
  } catch (error) {
    res.status(500).send(error)
  }
}

module.exports = {
  login
}
