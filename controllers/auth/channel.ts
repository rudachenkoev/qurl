import { generateHmacHash } from '@/helpers'
import crypto from 'crypto'
import { Request, Response } from 'express'
import Joi, { ValidationResult } from 'joi'
import Pusher from 'pusher'

const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET } = process.env

const pusher = new Pusher({
  appId: PUSHER_APP_ID || '',
  key: PUSHER_KEY || '',
  secret: PUSHER_SECRET || '',
  cluster: 'eu',
  useTLS: true
})

// Function of authorization channel generation
export const getAuthChannel = async (_: Request, res: Response) => {
  const randomToken = crypto.randomBytes(64).toString('hex')
  const timestamp = new Date().toISOString()
  const channel = generateHmacHash(`${timestamp}||${randomToken}`, PUSHER_SECRET as string)

  res.status(200).json({ channel })
}

interface AuthChannelConfirmationBody {
  email: string
  verificationCode: string
  password: string
}
const validateAuthChannelConfirmation = (values: AuthChannelConfirmationBody): ValidationResult => {
  const schema = Joi.object({
    channel: Joi.string().required(),
    token: Joi.string().required()
  })
  return schema.validate(values)
}

// Confirm channel authorization
export const confirmAuthChannel = async (req: Request, res: Response) => {
  // Check validation
  const { error } = validateAuthChannelConfirmation(req.body)
  if (error) {
    const errors = error.details.map(item => item.message)
    res.status(400).send(errors)
    return
  }

  const { channel, token } = req.body
  try {
    const response = await pusher.trigger(channel, 'login-event', { token })
    res.status(200).json(response)
  } catch (err) {
    res.status(400).json(err)
  }
}
