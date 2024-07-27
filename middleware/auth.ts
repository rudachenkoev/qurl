import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

interface AuthenticatedRequest extends Request {
  userId?: string
}

const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.get('Authorization')
  const token = authHeader?.split(' ')[1]

  if (!token) {
    res.sendStatus(401)
    return
  }

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err, decoded) => {
    if (err || !decoded || typeof decoded === 'string') {
      res.sendStatus(403)
      return
    }
    req.userId = (decoded as JwtPayload).id
    next()
  })
}

export { isAuthenticated }
