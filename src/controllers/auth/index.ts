import { Request, Response } from 'express'
import Joi from 'joi'
import { pool } from '@/db'
import userQueries from '@/queries/user'
import jwtTokenQueries from '@/queries/jwtToken'
import { generateAccessToken, generatePasswordHash } from '@helpers/auth'

const validateLogin = (values: Record<any, any>) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
  return schema.validate(values)
}

export const login = async (req: Request, res: Response) => {
  try {
    // Check validation
    const { error } = validateLogin(req.body)
    if (error) {
      const errors = error.details.map(item => item.message)
      res.status(400).send(errors)
      return
    }

    const { email, password } = req.body
    // Find user by credits
    const getUserRes = await pool.query(userQueries.getUserByEmailAndPassword, [email, generatePasswordHash(password)])
    const user = getUserRes.rows[0]
    if (!user) {
      res.status(400).send('No user information was found or the data is incorrect')
      return
    }
    // Update the current or create a new authorization token
    const getJwtTokenByUserRes = await pool.query(jwtTokenQueries.getJwtTokenByUser, [user.id])
    const userToken = getJwtTokenByUserRes.rows[0]
    const newToken = generateAccessToken(user.id)
    if (userToken) await pool.query(jwtTokenQueries.updateJwtTokenByUser, [newToken, user.id])
    else await pool.query(jwtTokenQueries.createJwtToken, [user.id, newToken])

    res.status(200).json({ bearer: newToken })
  } catch (error) {
    res.status(400).send(error)
  }
}
