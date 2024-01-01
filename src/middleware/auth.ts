import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader?.split(' ')[1]

  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any) => {
    if (err) return res.sendStatus(403)
    next()
  })
}
