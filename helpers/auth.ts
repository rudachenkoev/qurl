import { generateHmacHash } from '@helpers/index'
import jwt from 'jsonwebtoken'

// Generates a HMAC SHA-256 hash of the given password using a secret key.
export const generatePasswordHash = (password: string): string => {
  return generateHmacHash(password, process.env.PASSWORD_SECRET as string)
}

// Generates a JSON Web Token (JWT) for the specified user identifier.
export const generateAccessToken = (id: number): string => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET as string, { expiresIn: '12h' })
}

// Generates a 6-digit random code.
export const generateSixDigitCode = (): string => {
  const min = 100000 // minimum value (inclusive)
  const max = 999999 // maximum value (inclusive)
  const code = Math.floor(Math.random() * (max - min + 1)) + min
  return code.toString()
}
