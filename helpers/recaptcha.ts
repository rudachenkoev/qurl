import axios from 'axios'

export const checkRecaptchaValidity = async (value: String) => {
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${value}`
  const response = await axios.post(url)
  return {
    isValid: response.data.success,
    error: !response.data.success ? response.data['error-codes'][0] : ''
  }
}
