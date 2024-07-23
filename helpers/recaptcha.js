const axios = require('axios')

/**
 * Asynchronously checks the validity of a reCAPTCHA response using Google's API.
 * @param {string} value - The reCAPTCHA response from the client.
 * @returns {Promise<{isValid: boolean, error: string}>} An object indicating whether the response is valid and any error code.
 */
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
