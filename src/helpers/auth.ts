import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

export const authentication = (password: string):string => {
  return crypto.createHmac('sha256', password).update(process.env.PASSWORD_SECRET).digest('hex')
}

export const generateAccessToken = (ObjectId: Types.ObjectId) => {
  return jwt.sign({ ObjectId }, process.env.TOKEN_SECRET, { expiresIn: '12h' })
}
