import { ErrorReport } from 'joi'

// Validation function to check if a value contains at least one uppercase letter.
export const containsUppercase = (value: string, helpers: any): string | ErrorReport => {
  const uppercaseRegex = /^(?=.*[A-Z])/
  if (!uppercaseRegex.test(value)) {
    return helpers.message('Password must contain at least 1 uppercase letter')
  }
  return value
}

// Validation function to ensure a value contains at least one lowercase letter.
export const containsLowercase = (value: string, helpers: any): string | ErrorReport => {
  const lowercaseRegex = /^(?=.*[a-z])/
  if (!lowercaseRegex.test(value)) {
    return helpers.message('Password must contain at least 1 lowercase letter')
  }
  return value
}

// Validation function to ensure a value contains at least one digit.
export const containsNumber = (value: string, helpers: any): string | ErrorReport => {
  const numberRegex = /^(?=.*\d)/
  if (!numberRegex.test(value)) {
    return helpers.message('Password must contain at least 1 digit')
  }
  return value
}
