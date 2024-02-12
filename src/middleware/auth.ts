import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface ExtendedRequest extends Request {
  userObjectId: string
}

export const isAuthenticated = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization')
  const token = authHeader?.split(' ')[1]

  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err, decoded: JwtPayload) => {
    if (err) return res.sendStatus(403)
    req.userObjectId = decoded.ObjectId
    next()
  })
}
