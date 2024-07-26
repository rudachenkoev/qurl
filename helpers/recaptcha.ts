import axios from 'axios'

interface RecaptchaResponse {
  isValid: boolean
  error: string
}

// Asynchronously checks the validity of a reCAPTCHA response using Google's API.
export const checkRecaptchaValidity = async (value: string): Promise<RecaptchaResponse> => {
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${value}`
  const response = await axios.post(url)
  return {
    isValid: response.data.success,
    error: !response.data.success ? response.data['error-codes'][0] : ''
  }
}
