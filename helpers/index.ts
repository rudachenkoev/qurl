import crypto from 'crypto'

// Generates a HMAC SHA-256 hash
export const generateHmacHash = (str: string, secret: string) => {
  if (!str || !secret) return ''
  return crypto.createHmac('sha256', secret).update(str).digest('hex')
}
