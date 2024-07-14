import { Request, Response } from 'express'
import Joi from 'joi'
// import { generateAccessToken } from '@helpers/auth'

const validateLogin = (values: Record<any, any>) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
  return schema.validate(values)
}

export const login = async (req: Request, res: Response) => {
  // try {
  //   // Check validation
  //   const { error } = validateLogin(req.body)
  //   if (error) {
  //     const errors = error.details.map(item => item.message)
  //     return res.status(400).send(errors)
  //   }
  //   // Find user by credits
  //   const user = await getUserByCredits(req.body)
  //   if (!user) return res.status(404).send('No user information was found or the data is incorrect')
  //   // Authenticate user with new access token
  //   user.authentication.sessionToken = generateAccessToken(user._id)
  //   await user.save()
  //   res.status(200).json({ bearer: user.authentication.sessionToken })
  // } catch (error) {
  //   res.status(400).send(error)
  // }
}
