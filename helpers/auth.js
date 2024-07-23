const crypto = require('crypto')
const jwt = require('jsonwebtoken')

/**
 * Generates a HMAC SHA-256 hash of the given password using a secret key.
 *
 * @param {string} password - The password to be hashed.
 * @returns {string} - The resulting HMAC SHA-256 hash in hexadecimal format.
 *
 * This function uses the HMAC algorithm to securely hash the password with a secret key
 * provided by the environment variable PASSWORD_SECRET. The resulting hash can be used
 * to securely store and verify passwords.
 */
const generatePasswordHash = (password) => {
  return crypto.createHmac('sha256', password).update(process.env.PASSWORD_SECRET).digest('hex')
}

/**
 * Generates a JSON Web Token (JWT) for the specified user identifier.
 * @param id The user identifier for whom to generate the token.
 * @returns A JWT string token signed using the TOKEN_SECRET and valid for 12 hours.
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: '12h' })
}

/**
 * Generates a 6-digit random code.
 * @returns A string containing a random 6-digit code.
 */
const generateSixDigitCode = () => {
  const min = 100000 // minimum value (inclusive)
  const max = 999999 // maximum value (inclusive)
  const code = Math.floor(Math.random() * (max - min + 1)) + min
  return code.toString()
}

module.exports = {
  generatePasswordHash,
  generateAccessToken,
  generateSixDigitCode
}
