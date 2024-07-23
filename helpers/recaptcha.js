require('dotenv').config()
const axios = require('axios')

const checkRecaptchaValidity = async value => {
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${value}`
  const response = await axios.post(url)
  return {
    isValid: response.data.success,
    error: !response.data.success ? response.data['error-codes'][0] : ''
  }
}

module.exports = {
  checkRecaptchaValidity
}
