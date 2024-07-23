/**
 * Custom validation function to check if a value contains at least one uppercase letter.
 * @param {string} value - The value to be validated.
 * @param {Object} helpers - Validation helpers from the Joi library.
 * @returns {string} The original value if valid, or a validation error message if invalid.
 */

const containsUppercase = (value, helpers) => {
  const uppercaseRegex = /^(?=.*[A-Z])/
  if (!uppercaseRegex.test(value)) {
    return helpers.message('Password must contain at least 1 uppercase letter')
  }
  return value
}

/**
 * Custom validation function to ensure a value contains at least one lowercase letter.
 * @param {string} value - The value to be validated.
 * @param {Object} helpers - Validation helpers from the Joi library.
 * @returns {string} The original value if valid, or a validation error message if invalid.
 */
const containsLowercase = (value, helpers) => {
  const lowercaseRegex = /^(?=.*[a-z])/
  if (!lowercaseRegex.test(value)) {
    return helpers.message('Password must contain at least 1 lowercase letter')
  }
  return value
}

/**
 * Custom validation function to ensure a value contains at least one digit.
 * @param {string} value - The value to be validated.
 * @param {Object} helpers - Validation helpers from the Joi library.
 * @returns {string} The original value if valid, or a validation error message if invalid.
 */
const containsNumber = (value, helpers) => {
  const numberRegex = /^(?=.*\d)/
  if (!numberRegex.test(value)) {
    return helpers.message('Password must contain at least 1 digit')
  }
  return value
}

module.exports = {
  containsUppercase,
  containsLowercase,
  containsNumber
}
