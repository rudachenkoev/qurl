import Joi from 'joi'
import { createUser, IUser } from '@models/user'


const validateUser = (values: Record<any, any>) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    authentication: {
      password: Joi.string().required(),
      sessionToken: Joi.string().optional()
    }
  })
  return schema.validate(values)
}

export const createUserProfile = (body: IUser) => {
  return new Promise(async (resolve, reject) => {
    // Check validation
    const { error } = validateUser(body)
    if (error) reject(error.details.map(item => item.message))
    // Create new user profile
    const result = await createUser(body)
    resolve(result)
  })
}
