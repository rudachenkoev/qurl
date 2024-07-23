const containsUppercase = (value, helpers) => {
  const uppercaseRegex = /^(?=.*[A-Z])/
  if (!uppercaseRegex.test(value)) {
    return helpers.message('Password must contain at least 1 uppercase letter')
  }
  return value
}

const containsLowercase = (value, helpers) => {
  const lowercaseRegex = /^(?=.*[a-z])/
  if (!lowercaseRegex.test(value)) {
    return helpers.message('Password must contain at least 1 lowercase letter')
  }
  return value
}

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
