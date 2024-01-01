export const containsUppercase = (value: string, helpers: any) => {
  const uppercaseRegex = /^(?=.*[A-Z])/
  if (!uppercaseRegex.test(value)) {
    return helpers.message('Password must contain at least 1 uppercase letter')
  }
  return value
}

export const containsLowercase = (value: string, helpers: any) => {
  const lowercaseRegex = /^(?=.*[a-z])/
  if (!lowercaseRegex.test(value)) {
    return helpers.message('Password must contain at least 1 lowercase letter')
  }
  return value
}

export const containsNumber = (value: string, helpers: any) => {
  const numberRegex = /^(?=.*\d)/
  if (!numberRegex.test(value)) {
    return helpers.message('Password must contain at least 1 digit')
  }
  return value
}
